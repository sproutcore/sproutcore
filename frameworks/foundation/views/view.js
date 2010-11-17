// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/browser');
sc_require('system/event');
sc_require('system/cursor');
sc_require('system/responder') ;
sc_require('system/theme');

sc_require('mixins/string') ;

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

/**
  Default property to disable or enable by default the contextMenu
*/
SC.CONTEXT_MENU_ENABLED = YES;

/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.TABBING_ONLY_INSIDE_DOCUMENT = YES;

/**
  Tells the property (when fetched with themed()) to get its value from the renderer (if any).
*/
SC.FROM_THEME = "__FROM_THEME__"; // doesn't really matter what it is, so long as it is unique. Readability is a plus.

/** @private - custom array used for child views */
SC.EMPTY_CHILD_VIEWS_ARRAY = [];
SC.EMPTY_CHILD_VIEWS_ARRAY.needsClone = YES;

/**
  Map to CSS Transforms
*/

SC.CSS_TRANSFORM_MAP = {
  rotate: function(val){
    return null;
  },

  rotateX: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER || val === 0) val += 'deg';
    return 'rotateX('+val+')';
  },

  rotateY: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER || val === 0) val += 'deg';
    return 'rotateY('+val+')';
  },

  rotateZ: function(val){
    if (SC.typeOf(val) === SC.T_NUMBER || val === 0) val += 'deg';
    return 'rotateZ('+val+')';
  },

  scale: function(val){
    if (SC.typeOf(val) === SC.T_ARRAY) val = val.join(', ');
    return 'scale('+val+')';
  }
};

/**
  Properties that can be animated
*/
SC.ANIMATABLE_PROPERTIES = ["top", "left", "bottom", "right", "width", "height", "centerX", "centerY", "opacity", "scale", "rotate", "rotateX", "rotateY", "rotateZ"];

/**
  @class

  Base class for managing a view.  Views provide two functions:

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

  - *didAppendToDocument:* in theory all DOM setup could be done
    in didCreateLayer() as you already have a DOM element instantiated.
    However there is cases where the element has to be first appended to the
    Document because there is either a bug on the browser or you are using
    plugins which objects are not instantiated until you actually append the
    element to the DOM. This will allow you to do things like registering
    DOM events on flash or quicktime objects.

  @extends SC.Responder
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.View = SC.Responder.extend(SC.DelegateSupport,
/** @scope SC.View.prototype */ {

  concatenatedProperties: 'outlets displayProperties layoutProperties classNames renderMixin didCreateLayerMixin willDestroyLayerMixin createRendererMixin updateRendererMixin'.w(),

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

  /**
    Activates use of brower's static layout. To activate, set this
    property to YES.

    @property {Boolean}
  */
  useStaticLayout: NO,

  // ..........................................................
  // THEME SUPPORT
  //

  _baseThemeName: false,

  /**
    The base theme to start from; the "theme" property looks in this theme.
    baseTheme is inherited from parent's theme property.
  */
  baseTheme: null,

  /**
    This sets the base theme
  */
  _baseThemeProperty: function(key, value) {
    if (SC.typeOf(value) === SC.T_STRING) {
      this.set("_baseThemeName", value);
    }

    // find the base theme by name if we have a name.
    if (this.get("_baseThemeName")) {
      var theme = SC.Theme.find(this.get("_baseThemeName"));
      if (theme) return theme;
    }

    // otherwise, return parent's theme.
    var parent = this.get("parentView");
    if (parent) return parent.get("theme");

    return SC.Theme.find("sc-base");
  }.property().cacheable(),


  _last_theme: null, // used to determine if theme has changed since last time the property was evaluated.
  _themeName: false,

  // baseTheme is a "property"; since it gets set after extension of the view,
  // we need an observer in addition to it to actually do notifications.
  _baseThemeDidChange: function() {
    this.notifyPropertyChange("theme");
  }.observes("baseTheme"),

  _themeProperty: function(key, value) {
    // if it is a string, set theme name
    if (SC.typeOf(value) === SC.T_STRING) {
      this.set("_themeName", value);
    }

    // get the base theme
    var base = this.get("baseTheme");

    // find theme, if possible
    if (this.get("_themeName")) {
      // Note: theme instance "find" function will search every parent
      // _except_ global (which is not a parent)
      var theme;
      if (base) {
        theme = base.find(this.get("_themeName"));
        if (theme) return theme;
      }

      theme = SC.Theme.find(this.get("_themeName"));
      if (theme) return theme;
    }

    // can't find anything, return base.
    return base;
  }.property().cacheable(),

  _notifyThemeDidChange: function() {
    var len, idx, childViews = this.get("childViews");
    len = childViews.length;
    for (idx = 0; idx < len; idx++){
      childViews[idx].notifyPropertyChange("baseTheme");
      childViews[idx].notifyPropertyChange("theme");
    }
  },

  /**
    The current theme. You may only set this to a string, and during runtime, the value
    (from get()) will always be a theme object or null.
  */
  theme: null,

  /**
    Detects when the theme changes. Replaces the layer if necessary.
  */
  _themeDidChange: function() {
    var theme = this.get("theme");
    if (theme === this._last_theme) return;
    this._last_theme = theme;

    // replace the layer
    if (this.get("layer")) this.replaceLayer();

    // notify child views
    if (this._hasCreatedChildViews) this._notifyThemeDidChange();

    // and now, regenerate renderer
    this._generateRenderer();
  }.observes("theme"),

  /**
    Like "get", but if the value is SC.FROM_THEME, it will find the value from the view's
    renderer, if any; if none, then it will look for <property>Default and return that.
  */
  themed: function(property) {
    var val = this.get(property);
    if (val === SC.FROM_THEME) {
      if (this.renderer) {
        val = this.renderer[property];
        if (val !== undefined) return val;
      }
      return this.get(property + "Default");
    }
    return val;
  },

  /**
    @private
    Generates the view's renderer (calling _destroyRenderer on any old ones if needed).
  */
  _generateRenderer: function() {
    var theme = this.get("theme"); // renderers need a theme

    // reset the renderer (the theme changed, hello!)
    this._destroyRenderer();

    // now, if we do have a theme, we can try to create the renderer.
    if (theme && theme.isTheme) {
      this._viewRenderer = theme.view();

      if (this.createRenderer) {
        this.renderer = this.createRenderer(theme);

        // the renderer was not necessarily successfully created.
        if (this.renderer) {
          var mixins, idx, len;
          this.renderer.contentProvider = this; // set renderer's content provider to this (it will call renderContent, etc. as needed)
          if (mixins = this.createRendererMixin) {
            len = mixins.length;
            for (idx = 0; idx < len; idx++) mixins[idx].call(this, theme);
          }
        }
      }
    }

    // update!
    this._updateViewRenderer();
    this._updateRenderer();
  },

  /**
    @private
    Updates the view's renderer, if one exists, calling all mixins to renderer as well.
  */
  _updateRenderer: function() {
    var mixins, idx, len;
    if (this.renderer){
      this.updateRenderer(this.renderer);
      if (mixins = this.updateRendererMixin) {
        len = mixins.length;
        for (idx = 0; idx < len; idx++) mixins[idx].call(this, this.renderer);
      }
    }
  },

  _destroyRenderer: function() {
    if (!this.renderer) return;
    this.renderer.destroy();
    this.renderer = null;
  },

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

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function(){
    if(!this.get('isEnabled') && this.get('isFirstResponder')){
      this.resignFirstResponder();
    }
  }.observes('isEnabled'),

  // ..........................................................
  // MULTITOUCH SUPPORT
  //
  /**
    Set to YES if you want to receive touch events for each distinct touch (rather than only
    the first touch start and last touch end).
  */
  acceptsMultitouch: NO,

  /**
    Is YES if the view is currently being touched. NO otherwise.
  */
  hasTouch: NO,

  /**
    Whether to route touch events to mouse events (defaults to YES)
  */
  routeTouch: YES,

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
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function() {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),

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
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible'),
        parentView;

    // isVisibleInWindow = isVisible && parentView.isVisibleInWindow
    // this approach only goes up to the parentView if necessary.
    if (current) {
      // If we weren't passed in 'parentViewIsVisible' (we generally aren't;
      // it's an optimization), then calculate it.
      if (parentViewIsVisible === undefined) {
        parentView = this.get('parentView');
        parentViewIsVisible = parentView ? parentView.get('isVisibleInWindow') : NO;
      }
      current = current && parentViewIsVisible;
    }

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);

      var childViews = this.get('childViews'), len = childViews.length, idx;
      for(idx=0;idx<len;idx++) {
        childViews[idx].recomputeIsVisibleInWindow(current);
      }

      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) this.invokeOnce(this.layoutChildViewsIfNeeded);
      }
      else {
        // Also, if we were previously visible and were the first responder,
        // resign it.  This more appropriately belongs in a
        // 'isVisibleInWindow' observer or some such helper method because
        // this work is not strictly related to computing the visibility, but
        // view performance is critical, so avoiding the extra observer is
        // worthwhile.
        if (this.get('isFirstResponder')) this.resignFirstResponder();
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },


  /** @private
    Whenever the view’s visibility changes, we need to recompute whether it is
    actually visible inside the window (a view is only visible in the window
    if it is marked as visibile and its parent view is as well), in addition
    to updating the layer accordingly.
  */
  _sc_isVisibleDidChange: function() {
    // 'isVisible' is effectively a displayProperty, but we'll call
    // displayDidChange() manually here instead of declaring it as a
    // displayProperty because that avoids having two observers on
    // 'isVisible'.  A single observer is:
    //   a.  More efficient
    //   b.  More correct, because we can guarantee the order of operations
    this.displayDidChange();

    this.recomputeIsVisibleInWindow();
  }.observes('isVisible'),



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
    var pane = view.get('pane');
    if(pane && pane.get('isPaneAttached')) {
      view._notifyDidAppendToDocument();
    }

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
    var childViews = this.get('childViews'),
        idx = childViews.indexOf(view) ;
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
    Replaces the current array of child views with the new array of child
    views.

    @param {Array} views views you want to add
    @returns {SC.View} receiver
  */
  replaceAllChildren: function(views) {
    var len = views.get('length'), idx;

    this.beginPropertyChanges();
    this.destroyLayer().removeAllChildren();
    for(idx=0;idx<len;idx++) this.appendChild(views.objectAt(idx));
    this.replaceLayer();
    this.endPropertyChanges();

    return this ;
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

    this.resetBuildState();
    this.notifyPropertyChange("baseTheme");
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;

    // We also need to iterate down through the view hierarchy and invalidate
    // all our child view's caches for 'pane', since it could have changed.
    //
    // Note:  In theory we could try to avoid this invalidation if we
    //        do this only in cases where we "know" the 'pane' value might
    //        have changed, but those cases are few and far between.

    this._invalidatePaneCacheForSelfAndAllChildViews();

    return this ;
  },

  /** @private
    We want to cache the 'pane' property, but it's impossible for us to
    declare a dependence on all properties that can affect the value.  (For
    example, if our grandparent gets attached to a new pane, our pane will
    have changed.)  So when there's the potential for the pane changing, we
    need to invalidate the caches for all our child views, and their child
    views, and so on.
  */
  _invalidatePaneCacheForSelfAndAllChildViews: function () {
    var childView, childViews = this.get('childViews'),
        len = childViews.length, idx ;

    this.notifyPropertyChange('pane');

    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (childView._invalidatePaneCacheForSelfAndAllChildViews) {
        childView._invalidatePaneCacheForSelfAndAllChildViews();
      }
    }
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
    // return an object selecting the document.
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
  layerId: function(key, value) {
    if (value) this._layerId = value;
    if (this._layerId) return this._layerId;
    return SC.guidFor(this) ;
  }.property().cacheable(),

  _lastLayerId: null,

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function() {
    var layer  = this.get("layer"),
        lid    = this.get("layerId"),
        lastId = this._lastLayerId;
    if (lid !== lastId) {
      // if we had an earlier one, remove from view hash.
      if (lastId && SC.View.views[lastId] === this) {
        delete SC.View.views[lastId];
      }

      // set the current one as the new old one
      this._lastLayerId = lid;

      // and add the new one
      SC.View.views[lid] = this;

      // and finally, set the actual layer id.
      if (layer) layer.id = lid;
    }
  }.observes("layerId"),

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
    var layerId = this.get('layerId'),
        node, i, ilen, childNodes, elem, usedQuerySelector;

    // first, let's try the fast path...
    elem = document.getElementById(layerId) ;

    // TODO: use code generation to only really do this check on IE
    if (SC.browser.msie && elem && elem.id !== layerId) elem = null;

    // if no element was found the fast way, search down the parentLayer for
    // the element.  This code should not be invoked very often.  Usually a
    // DOM element will be discovered by the first method above.
    // This code uses a BFS algorithm as is expected to find the layer right
    // below the parent.
    if (!elem) {
      elem = parentLayer.firstChild ;
      var q = [];
      q.push(parentLayer);
      while (q.length !==0) {
        node = q.shift();
        if (node.id===layerId) {
          return node;
        }
        childNodes = node.childNodes;
        for (i=0, ilen=childNodes.length;  i < ilen;  ++i) {
          q.push(childNodes[i]);
        }
      }
      elem = null;
    }

    return elem;
  },

  /**
    Returns YES if the receiver is a subview of a given view or if it’s
    identical to that view. Otherwise, it returns NO.

    @property {SC.View} view
  */
  isDescendantOf: function(view) {
    var parentView = this.get('parentView');

    if(this===view) return YES;
    else if(parentView) return parentView.isDescendantOf(view);
    else return NO;
  },

  /**
    This method is invoked whenever a display property changes.  It will set
    the layerNeedsUpdate method to YES.  If you need to perform additional
    setup whenever the display changes, you can override this method as well.

    @returns {SC.View} receiver
  */
  displayDidChange: function() {
    this.set('layerNeedsUpdate', YES) ;
    return this;
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
    the 'skipIsVisibleInWindowCheck' parameter.

    You should not override this method.  Instead override updateLayer() or
    render().

    @returns {SC.View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function(skipIsVisibleInWindowCheck) {
    var needsUpdate  = this.get('layerNeedsUpdate'),
        shouldUpdate = needsUpdate  &&  (skipIsVisibleInWindowCheck || this.get('isVisibleInWindow'));
    if (shouldUpdate) {
      // only update a layer if it already exists
      if (this.get('layer')) {
        this.beginPropertyChanges() ;
        this.set('layerNeedsUpdate', NO) ;
        this.updateLayer() ;
        this.endPropertyChanges() ;
      }
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

    @param optionalContext provided only for backwards-compatibility.

    @returns {SC.View} receiver
  */
  updateLayer: function(optionalContext) {
    var mixins, idx, len, renderer = this.renderer, viewRenderer = this._viewRenderer;


    // make sure to update any renderers
    this._updateRenderer();

    // Now, update using renderer if possible; render() otherwise
    if (!this._useRenderFirst && this.createRenderer) {
      this.updateViewSettings();
      if (renderer) renderer.update();
    } else {
      var context = optionalContext || this.renderContext(this.get('layer')) ;

      this.renderViewSettings(context, NO);
      this.render(context, NO) ;

      if (mixins = this.renderMixin) {
        len = mixins.length;
        for(idx=0; idx<len; ++idx) mixins[idx].call(this, context, NO) ;
      }

      context.update() ;
      if (context._innerHTMLReplaced) {
        var pane = this.get('pane');
        if(pane && pane.get('isPaneAttached')) {
          this._notifyDidAppendToDocument();
        }
      }
    }

    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) this.viewDidResize();

    if (this.didUpdateLayer) this.didUpdateLayer(); // call to update DOM
    if(this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
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

    // now prepare the content like normal.
    this.renderToContext(context) ;
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
    // notify, not just the view, but also the view renderers
    this.notifyPropertyChange("layer");
    this._viewRenderer.attachLayer(this);
    if (this.renderer) this.renderer.attachLayer(this);
    if (this.didCreateLayer) this.didCreateLayer() ;

    // Animation prep
    if (SC.platform.supportsCSSTransitions) this.resetAnimation();

    // and notify others
    var mixins = this.didCreateLayerMixin, len, idx,
        childViews = this.get('childViews'),
        childView;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }

    len = childViews.length ;
    for (idx=0; idx<len; ++idx) {
      childView = childViews[idx];
      if (!childView) continue;

      // A parent view creating a layer might result in the creation of a
      // child view's DOM node being created via a render context without
      // createLayer() being invoked on the child.  In such cases, if anyone
      // had requested 'layer' and it was cached as null, we need to
      // invalidate it.
      childView.notifyPropertyChange('layer');

      childView._notifyDidCreateLayer() ;
    }
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

      if (this._viewRenderer) {
        this._viewRenderer.detachLayer();
      }

      // tell the renderer the layer has gone away
      if (this.renderer) {
        this.renderer.detachLayer();
      }

      // do final cleanup
      if (layer.parentNode) layer.parentNode.removeChild(layer) ;
      layer = null ;
    }
    return this ;
  },

  /**
    Destroys and recreates the current layer.  This can be more efficient than
    modifying individual child views.

    @returns {SC.View} receiver
  */
  replaceLayer: function() {
    this.destroyLayer();
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;
  },

  /** @private -
    Invokes willDestroyLayer() on view and child views.  Then sets layer to
    null for receiver.
  */
  _notifyWillDestroyLayer: function() {
    if (this.willDestroyLayer) this.willDestroyLayer() ;
    var mixins = this.willDestroyLayerMixin, len, idx,
        childViews = this.get('childViews') ;
    if (mixins) {
      len = mixins.length ;
      for (idx=0; idx<len; ++idx) mixins[idx].call(this) ;
    }

    len = childViews.length ;
    for (idx=0; idx<len; ++idx) childViews[idx]._notifyWillDestroyLayer() ;

    this.set('layer', null) ;
  },


  isLayerProvider: YES,
  /**
    @private (semi)
    Returns the layer. Meant only for use from renderers and such—this is a layer provider function.
  */
  getLayer: function() {
    return this.get("layer");
  },

  /**
    @private

    Renders to a context.
    Rendering only happens for the initial rendering. Further updates happen in updateLayer,
    and are not done to contexts, but to layers.

    Both renderToContext and updateLayer will call render(context, firstTime) as needed
    to maintain backwards compatibility, but prefer calling createRenderer.

    Note: You should not generally override nor directly call this method. This method is only
    called by createLayer to set up the layer initially, and by renderChildViews, to write to
    a context.

    @param {SC.RenderContext} context the render context.
    @param {Boolean} firstTime Provided for compatibility when rendering legacy views only.
  */
  renderToContext: function(context, firstTime) {
    var mixins, idx, len;

    this.beginPropertyChanges() ;
    this.set('layerNeedsUpdate', NO) ;

    this.renderViewSettings(context, YES);

    /* Now, the actual rendering, which will use a renderer if possible */
    // the renderer will have been created when the theme was found; if it is around,
    // we just need to ensure it is up-to-date
    if (this.createRenderer) {
      // our private version does mixins too! Yay!
      this._updateRenderer();
    }

    if (!this._useRenderFirst && this.createRenderer) {
      if (this.renderer) this.renderer.render(context);
    } else {
      if (SC.none(firstTime)) firstTime = YES;

      this.render(context, firstTime);
      if (mixins = this.renderMixin) {
        len = mixins.length;
        for(idx=0; idx<len; ++idx) mixins[idx].call(this, context, firstTime) ;
      }
    }

    this.endPropertyChanges() ;
  },

  /**
    @private
    Updates the properties of the renderer used for the view
  */
  _updateViewRenderer: function() {
    if (!this._viewRenderer) return;

    var classNames = this.get('classNames');
    if (this.get('theme')) {
      classNames = classNames.concat(this.get("theme").classNames);
    }

    // for backwards compatibility, make sure we push the theme name if it is not there already. This
    // is extremely questionable, but necessary at least for buttons. We maybe want to move this just
    // to such at some point.
    // TODO: consider
    // SC2.0: this should go away.
    if (this._themeName && classNames.indexOf(this._themeName) < 0) classNames.push(this._themeName);

    // get cursor:
    var cursor = this.get("cursor");
    if (!cursor && this.get('shouldInheritCursor')) {
      // If this view has no cursor and should inherit it from the parent,
      // then it sets its own cursor view.  This sets the cursor rather than
      // simply using the parent's cursor object so that its cursorless
      // childViews can also inherit it.
      cursor = this.getPath('parentView.cursor');
    }

    this._viewRenderer.attr({
      layerId: this.layerId ? this.get('layerId') : SC.guidFor(this),
      classNames: classNames,
      backgroundColor: this.get('backgroundColor'),
      role: this.get('ariaRole'),
      cursor: cursor,
      isTextSelectable: this.get('isTextSelectable'),
      isEnabled: this.get('isEnabled'),
      isVisible: this.get('isVisible'),
      isFirstResponder: this.get('isFirstResponder'),
      hasStaticLayout: this.get('useStaticLayout')
    });
  },

  /**
    @private
    Renders view settings (class names and id, for instance) to the context.

    firstTime is provided because we have a case in which renderViewSettings may be called when !firstTime,
    so that we can set things on the context (because other things are going through the context,
    due to the use of a render() function in the derived class that uses context).

    If !firstTime, we don't actually have to update layout (updateLayout handles it).
  */
  renderViewSettings: function(context, firstTime) {
    if (SC.none(firstTime)) firstTime = YES;

    this._updateViewRenderer();
    this._viewRenderer.render(context);

    if (firstTime) this.renderLayout(context, YES);
  },

  /**
    @private
    Updates view settings on the context (including class names).
  */
  updateViewSettings: function() {
    this._updateViewRenderer();
    this._viewRenderer.update();
  },

  /**
  @private

    Invoked by createLayer() and updateLayer() to actually render a context.
    This method calls the render() method on your view along with any
    renderMixin() methods supplied by mixins you might have added.

    You should not override this method directly. Nor should you call it. It is OLD.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @returns {void}
  */
  prepareContext: function(context, firstTime) {
    // eventually, firstTime will be removed because it is ugly.
    // for now, we will sense whether we are doing things the ugly way or not.
    // if ugly, we will allow updates through.
    if (SC.none(firstTime)) firstTime = YES; // the GOOD code path :)
    if (firstTime) {
      this.renderToContext(context);
    } else {
      this.updateLayer(context);
    }
  },

  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.

    If a context is provided, it is always assumed to be firstTime.

    @deprecated In SproutCore 1.1. Use renderContent and updateContent explicitly instead.
    @param {SC.RenderContext} context the context
    @param {Boolean} firstName true if the layer is being created
    @returns {SC.RenderContext} the render context
    @test in render and renderer
  */
  renderChildViews: function(context, firstTime) {
    if (firstTime || context) {
      // we pass along firstTime for compatibility. Some older (less wise) views may
      // think it will work. Well, it wouldn't, but we'll make it work.
      this.renderContent(context, firstTime);
    } else {
      this.updateContent(context);
    }
    return context;
  },

  /**
    @private
    Views are content suppliers for renderers. That is, views pass themselves to renderers
    for renderers' "content" properties. Content providers have two functions: renderContent and updateContent.
    This is the first of those.

    @param {SC.RenderContext} context
    @param {Boolean} firstTime For compatibility (do not use; if not first time, call updateContent).
  */
  renderContent: function(context, firstTime) {
    var cv = this.get('childViews'), len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      if (!view) continue;
      context = context.begin(view.get('tagName')) ;
      view.renderToContext(context, firstTime);
      context = context.end() ;
    }
  },

  /**
    @private
    Views are content suppliers for renderers. That is, views pass themselves to renderers
    for renderers' "content" properties. Content providers have two functions: renderContent and updateContent.
    This is the first of those.

    For old-style rendering, the render context created by the parent renderer is passed along
    as well.
  */
  updateContent: function(optionalContext) {
    var cv = this.get('childViews'), len = cv.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = cv[idx] ;
      if (!view) continue;

      view.updateLayer(optionalContext);
    }
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
    var renderer = this.renderer;
    if (this.createRenderer && renderer) {
      if (firstTime) {
        renderer.render(context);
      } else {
        renderer.update();
      }
    } else {
      if (firstTime) this.renderChildViews(context, firstTime);
    }
  },


  /** @private -
    Invokes the receivers didAppendLayerToDocument() method if it exists and
    then invokes the same on all child views.
  */

  _notifyDidAppendToDocument: function() {
    if (this.didAppendToDocument) this.didAppendToDocument();

    var i=0, child, childLen, children = this.get('childViews');
    for(i=0, childLen=children.length; i<childLen; i++) {
      child = children[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }
  },

  childViewsObserver: function(){
    var childViews = this.get('childViews'), i, iLen, child;
    for(i=0, iLen = childViews.length; i<iLen; i++){
      child = childViews[i];
      if(child._notifyDidAppendToDocument){
        child._notifyDidAppendToDocument();
      }
    }
  }.observes('childViews'),

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

  ariaRole: null,

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

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because the same effect is implemented
    inside _sc_isVisibleDidChange().  This avoids having two observers on
    'isVisible', which is:
      a.  More efficient
      b.  More correct, because we can guarantee the order of operations

    @property {Array}
    @readOnly
  */
  displayProperties: ['isFirstResponder'],

  /**
    You can set this to an SC.Cursor instance; its class name will
    automatically be added to the layer's classNames, allowing you
    to efficiently change the cursor for a large group of views with
    just one change to the SC.Cursor object.  The cursor property
    is only used when the layer is created, so if you need to change
    it to a different cursor object, you will have to destroy and
    recreate the view layer.  (In this case you might investigate
    setting cursors using CSS directly instead of SC.Cursor.)

    @property {SC.Cursor String}
  */
  cursor: null,

  /**
    A child view without a cursor of its own inherits its parent's cursor by
    default.  Set this to NO to prevent this behavior.

    @property {Boolean}
  */
  shouldInheritCursor: YES,

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
    var node = this.get('layer'),
        parentView = this.get('parentView'),
        parentNode = parentView ? parentView.get('containerLayer') : null ;

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
        if (!node) return; // can't do anything without a node.
      }

      var siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this)+1),
          nextNode = (nextView) ? nextView.get('layer') : null ;

      // before we add to parent node, make sure that the nextNode exists...
      if (nextView && (!nextNode || nextNode.parentNode!==parentNode)) {
        nextView.updateLayerLocationIfNeeded() ;
        nextNode = nextView.get('layer') ;
      }

      // add to parentNode if needed.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        parentNode.insertBefore(node, nextNode) ;
      }
    }

    parentNode = parentView = node = nextNode = null ; // avoid memory leaks

    this.set('layerLocationNeedsUpdate', NO) ;

    return this ;
  },

  // .......................................................
  // SC.RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),


  /** @property
    Set to YES if your view is willing to accept first responder status.  This
    is used when calculcating key responder loop.
  */
  acceptsFirstResponder: NO,

  // ..........................................................
  // KEY RESPONDER
  //

  /** @property
    YES if the view is currently first responder and the pane the view belongs
    to is also key pane.  While this property is set, you should expect to
    receive keyboard events.
  */
  isKeyResponder: NO,

  /**
    This method is invoked just before you lost the key responder status.
    The passed view is the view that is about to gain keyResponder status.
    This gives you a chance to do any early setup. Remember that you can
    gain/lose key responder status either because another view in the same
    pane is becoming first responder or because another pane is about to
    become key.

    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},

  /**
    This method is invoked just before you become the key responder.  The
    passed view is the view that is about to lose keyResponder status.  You
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because
    another view in the same pane is becoming first responder or because
    another pane is about to become key.

    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},

  /**
    Invokved just after the responder loses key responder status.
  */
  didLoseKeyResponderTo: function(responder) {},

  /**
    Invoked just after the responder gains key responder status.
  */
  didBecomeKeyResponderFrom: function(responder) {},

  /**
    This method will process a key input event, attempting to convert it to
    an appropriate action method and sending it up the responder chain.  The
    event is converted using the SC.KEY_BINDINGS hash, which maps key events
    into method names.  If no key binding is found, then the key event will
    be passed along using an insertText() method.

    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(), cmd = codes[0], chr = codes[1], ret;

    if (!cmd && !chr) return null ;  //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      var methodName = SC.MODIFIED_KEY_BINDINGS[cmd] || SC.BASE_KEY_BINDINGS[cmd.match(/[^_]+$/)[0]];
      if (methodName) {
        var target = this, pane = this.get('pane'), handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    }

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert
      // of the text.  Since this is not an action, do not send it up the
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===YES ? this : ret) : null ; // map YES|NO => this|nil
    }

    return null ; //nothing to do.
  },

  /**
    This method is invoked by interpretKeyEvents() when you receive a key
    event matching some plain text.  You can use this to actually insert the
    text into your application, if needed.

    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return NO ;
  },

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
    var ret = NO,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1 ;
    while (!ret && (++idx < len)) {
      ret = childViews[idx].performKeyEquivalent(keystring, evt) ;
    }
    return ret ;
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next child.
  */
  nextKeyView: null,

  /**
    Computes the next valid key view, possibly returning the receiver or null.
    This is the next key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var seen = [],
        rootView = this.get('pane'), ret = this.get('nextKeyView');

    if(!ret) ret = rootView._computeNextValidKeyView(this, seen);

    if(SC.TABBING_ONLY_INSIDE_DOCUMENT && !ret) {
      ret = rootView._computeNextValidKeyView(rootView, seen);
    }

    return ret ;
  }.property('nextKeyView'),

  _computeNextValidKeyView: function(currentView, seen) {
    var ret = this.get('nextKeyView'),
        children, i, childLen, child;
    if(this !== currentView && seen.indexOf(currentView)!=-1 &&
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles

    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=0, childLen = children.length; i<childLen; i++){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computeNextValidKeyView(currentView, seen);
        }
        if (ret) return ret;
      }
      ret = null;
    }
    return ret ;
  },

  /**
    Optionally points to the previous key view that should gain focus when
    tabbing through the interface. If this is not set then the previous
    key view will be set automatically to the previous child.
  */
  previousKeyView: null,

  /**
    Computes the previous valid key view, possibly returning the receiver or
    null.  This is the previous key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  previousValidKeyView: function() {
    var seen = [],
        rootView = this.pane(), ret = this.get('previousKeyView');
    if(!ret) ret = rootView._computePreviousValidKeyView(this, seen);
    return ret ;
  }.property('previousKeyView'),

  _computePreviousValidKeyView: function(currentView, seen) {
    var ret = this.get('previousKeyView'),
        children, i, child;

    if(this !== currentView && seen.indexOf(currentView)!=-1 &&
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles

    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=children.length-1; 0<=i; i--){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computePreviousValidKeyView(currentView, seen);
        }
        if (ret) return ret;
      }
      ret = null;
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

    // set up theme
    var baseTheme = this.baseTheme;
    this.baseTheme = this._baseThemeProperty;
    this.set("baseTheme", baseTheme);

    var theme = this.theme;
    this.theme = this._themeProperty;
    this.set("theme", theme);

    // find render path (to be removed in SC 2.0?)
    var renderAge = -1, rendererAge = -1, currentAge = 0, c = this.constructor;
    while (c && c.prototype.render) {
      if (renderAge < 0 && c.prototype.render !== this.render) renderAge = currentAge;
      if (rendererAge < 0 && c.prototype.createRenderer !== this.createRenderer) rendererAge = currentAge;
      if (rendererAge >= 0 && renderAge >= 0) break;
      currentAge = currentAge + 1;
      c = c.superclass;
    }

    // which one?
    if (renderAge < rendererAge && renderAge >= 0) {
      this._useRenderFirst = YES;
    } else {
      this._useRenderFirst = NO;
    }

    // register for event handling
    SC.View.views[this.get('layerId')] = this;

    var childViews = this.get('childViews');

    // setup child views.  be sure to clone the child views array first
    this.childViews = childViews ? childViews.slice() : [] ;
    this.createChildViews() ; // setup child Views
    this._hasCreatedChildViews = YES;

    // register display property observers ..
    // TODO: Optimize into class setup
    dp = this.get('displayProperties') ;
    idx = dp.length ;
    while (--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange) ;
    }

    // register for drags
    if (this.get('isDropTarget')) SC.Drag.addDropTarget(this) ;

    // register scroll views for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.addScrollableView(this) ;

    this._previousLayout = this.get('layout');
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
    for (idx=0; idx<len; ++idx) {
      if (!childViews[idx]) continue ;
      childViews[idx].awake() ;
    }
  },

  /**
    You must call this method on a view to destroy the view (and all of its
    child views). This will remove the view from any parent node, then make
    sure that the DOM element managed by the view can be released by the
    memory manager.
  */
  destroy: function() {
    if (this.get('isDestroyed')) return this; // nothing to do

    this._destroy(); // core destroy method

    // remove from parent if found
    this.removeFromParent() ;

    // unregister for drags
    if (this.get('isDropTarget')) SC.Drag.removeDropTarget(this) ;

    // unregister for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.removeScrollableView(this) ;

    //Do generic destroy. It takes care of mixins and sets isDestroyed to YES.
    sc_super();
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
      for (idx=0; idx<len; ++idx) childViews[idx].destroy() ;
    }

    // next remove view from global hash
    delete SC.View.views[this.get('layerId')] ;
    delete this._CQ ;
    delete this.page ;

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

        if (!view) {
          console.error ("No view with name "+key+" has been found in "+this.toString());
          // skip this one.
          continue;
        }

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
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    if (!attrs.page) attrs.page = this.page ;

    // Now add this to the attributes and create.
    view = view.create(attrs) ;
    return view ;
  },

  // ...........................................
  // LAYOUT
  //

  /**
    The 'frame' property depends on the 'layout' property as well as the
    parent view’s frame.  In order to properly invalidate any cached values,
    we need to invalidate the cache whenever 'layout' changes.  However,
    observing 'layout' does not guarantee that; the observer might not be run
    immediately.

    In order to avoid any window of opportunity where the cached frame could
    be invalid, we need to force layoutDidChange() to always immediately run
    whenever 'layout' is set.
  */
  propertyDidChange: function(key, value, _keepCache) {
    // If the key is 'layout', we need to call layoutDidChange() immediately
    // so that if the frame has changed any cached values (for both this view
    // and any child views) can be appropriately invalidated.

    // To allow layout to be a computed property, we check if any property has
    // changed and if layout is dependent on the property.
    // If it is we call layoutDidChange.
    var layoutChange=false;
    if(typeof this.layout === "function" && this._kvo_dependents) {
      var dependents = this._kvo_dependents[key];
      if(dependents && dependents.indexOf('layout')!=-1) layoutChange = true;
    }
    if(key==='layout' || layoutChange) this.layoutDidChange();
    // Resume notification as usual.
    sc_super();
  },


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
    // now set adjusted layout
    if (didChange) this.set('layout', layout) ;

    return this ;
  },


  /**
    Animate a given property using CSS animations.

    Takes a key, value and either a duration, or a hash of options.
    The options hash has the following parameters
      - duration: Duration of animation in seconds
      - callback: Callback method to run when animation completes
      - timing: Animation timing function

    @param {String|Hash} key
    @param {Object} value
    @params {Number|Hash} duration or options
    @returns {SC.View} receiver
  */
  animate: function(keyOrHash, valueOrOptions, optionsOrCallback, callback) {
    var hash, options;

    if (SC.typeOf(keyOrHash) === SC.T_HASH) {
      hash = keyOrHash;
      options = valueOrOptions;
      callback = optionsOrCallback;
    } else {
      hash = {};
      hash[keyOrHash] = valueOrOptions;
      options = optionsOrCallback;
    }

    if (SC.typeOf(options) === SC.T_NUMBER) {
      options = { duration: options };
    } else if (SC.typeOf(options) !== SC.T_HASH) {
      throw "Must provide options hash or duration!";
    }

    if (callback) options.callback = callback;


    var layout = SC.clone(this.get('layout')), didChange = NO, value, cur, animValue, curAnim, key;

    for(key in hash) {
      if (!hash.hasOwnProperty(key)) continue;
      value = hash[key];
      cur = layout[key];

      if (SC.ANIMATABLE_PROPERTIES.contains(key)) {
        curAnim = layout['animate'+key.capitalize()];

        if (value === null || value === undefined) {
          throw "Can only animate to an actual value!";
        } else {
          if (cur !== value) didChange = YES;

          // FIXME: We should check more than duration
          // Also, will we allow people to just set a number instead of a hash? If so, we have to account for that.
          if (curAnim && curAnim.duration !== options.duration) didChange = YES ;

          layout[key] = value ;

          // I'm pretty sure we want to be cloning this because we may be applying it
          // to multiple properties which can be edited independently
          layout['animate'+key.capitalize()] = SC.clone(options);
        }
      } else {
        if (cur !== value) didChange = YES;
        layout[key] = value;
      }
    }

    // now set adjusted layout
    if (didChange) this.set('layout', layout) ;

    return this ;
  },

  /**
  Resets animation, stopping all existing animations.
  */
  resetAnimation: function() {
    var layout = this.get('layout'), didChange = NO, key;
    for (key in layout) {
      if (key.substring(0,7) === 'animate') {
        didChange = YES;
        delete layout[key];
      }
    }
    if (didChange) {
      this.set('layout', layout);
      this.notifyPropertyChange('layout');
    }
    return this;
  },

  _scv_willRenderAnimations: function(){
    if (SC.platform.supportsCSSTransitions) {
      var layer = this.get('layer'),
          currentStyle = layer ? layer.style : null,
          newStyle = this.get('layoutStyle'),
          transitionStyle = newStyle[SC.platform.domCSSPrefix+"Transition"],
          layout = this.get('layout'),
          key, callback, idx;

      // Handle existing animations
      if (this._activeAnimations) {
        for(key in this._activeAnimations){
          // TODO: Check for more than duration
          if (
            newStyle[key] !== (currentStyle ? currentStyle[key] : null) ||
            !this._pendingAnimations || !this._pendingAnimations[key] ||
            this._activeAnimations[key].duration !== this._pendingAnimations[key].duration
          ) {
            callback = this._activeAnimations[key].callback;
            if (callback) {
              if (this._animatedTransforms && this._animatedTransforms.length > 0) {
                for (idx=0; idx < this._animatedTransforms.length; idx++) {
                  this._scv_runAnimationCallback(callback, null, this._animatedTransforms[idx], YES);
                }
                this._animatedTransforms = null;
              } else {
                this._scv_runAnimationCallback(callback, null, key, YES);
              }
            }

            this._scv_removeAnimationFromLayout(key, YES);
          }
        }
      }

      this._activeAnimations = this._pendingAnimations;
      this._pendingAnimations = null;
    }
  },

  _scv_didRenderAnimations: function(){
    if (!SC.platform.supportsCSSTransitions) {
      var key, callback;
      // Transitions not supported
      for (key in this._pendingAnimations) {
        callback = this._pendingAnimations[key].callback;
        if (callback) this._scv_runAnimationCallback(callback, null, key, NO);
        this._scv_removeAnimationFromLayout(key, NO, YES);
      }
      this._activeAnimations = this._pendingAnimations = null;
    }
  },

  _scv_removeAnimationFromLayout: function(propertyName, updateStyle, isPending) {

    if (updateStyle) {
      var layer = this.get('layer'),
          updatedCSS = [], key;
      for(key in this._activeAnimations) {
        if (key !== propertyName) updatedCSS.push(this._activeAnimations[key].css);
      }

      // FIXME: Not really sure this is the right way to do it, but we don't want to trigger a layout update
      if (layer) layer.style[SC.platform.domCSSPrefix+"Transition"] = updatedCSS.join(', ');
    }


    var layout = this.get('layout'),
        idx;

    if (propertyName === '-'+SC.platform.cssPrefix+'-transform' && this._animatedTransforms && this._animatedTransforms.length > 0) {
      for(idx=0; idx < this._animatedTransforms.length; idx++) {
        delete layout['animate'+this._animatedTransforms[idx].capitalize()];
      }
      this._animatedTransforms = null;
    }
    delete layout['animate'+propertyName.capitalize()];

    if (!isPending) delete this._activeAnimations[propertyName];
  },

  _scv_runAnimationCallback: function(callback, evt, propertyName, cancelled) {
    if (callback) {
      if (SC.typeOf(callback) !== SC.T_HASH) callback = { action: callback };
      callback.source = this;
      if (!callback.target) callback.target = this;
    }
    SC.View.runCallback(callback, { event: evt, propertyName: propertyName, view: this, isCancelled: cancelled });
  },

  /**
    Called when animation ends, should not usually be called manually
  */
  transitionDidEnd: function(evt){
    // WARNING: Sometimes this will get called more than once for a property. Not sure why.

    var propertyName = evt.originalEvent.propertyName,
        layout = this.get('layout'),
        animation, idx;

    animation = this._activeAnimations ? this._activeAnimations[propertyName] : null;

    if(animation) {
      if (animation.callback) {
        // Charles says this is a good idea
        SC.RunLoop.begin();
        // We're using invokeLater so we don't trigger any layout changes from the callbacks until the animations are done
        if (this._animatedTransforms && this._animatedTransforms.length > 0) {
          for (idx=0; idx < this._animatedTransforms.length; idx++) {
            this.invokeLater('_scv_runAnimationCallback', 1, animation.callback, evt, this._animatedTransforms[idx], NO);
          }
        } else {
          this.invokeLater('_scv_runAnimationCallback', 1, animation.callback, evt, propertyName, NO);
        }
        SC.RunLoop.end();
      }

      this._scv_removeAnimationFromLayout(propertyName, YES);
    }
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
    receiver's view.

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
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;

    // walk up this side
    //Note: Intentional assignment of variable f
    while (view && (f = view.get('frame'))) {
      myX += f.x; myY += f.y ;
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
    Attempt to scroll the view to visible.  This will walk up the parent
    view hierarchy looking looking for a scrollable view.  It will then
    call scrollToVisible() on it.

    Returns YES if an actual scroll took place, no otherwise.

    @returns {Boolean}
  */
  scrollToVisible: function() {
    var pv = this.get('parentView');
    while(pv && !pv.get('isScrollable')) pv = pv.get('parentView');

    // found view, first make it scroll itself visible then scroll this.
    if (pv) {
      pv.scrollToVisible();
      return pv.scrollToVisible(this);
    } else return NO ;
  },

  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.

    @property {Rect}
    @test in layoutStyle
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidChange to check the frame for us

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
    var layout = this.get('layout'),
        f = {} , error, layer, AUTO = SC.LAYOUT_AUTO,
        stLayout = this.get('useStaticLayout'),
        pv = this.get('parentView'),
        dH, dW, //shortHand for parentDimensions
        borderTop, borderLeft,
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW !== undefined &&
        lW === SC.LAYOUT_AUTO &&
        stLayout !== undefined && !stLayout) {
      error = SC.Error.desc(("%@.layout() cannot use width:auto if "+
                "staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
      console.error(error.toString()) ;
      throw error ;
    }

    if (lH !== undefined &&
        lH === SC.LAYOUT_AUTO &&
        stLayout !== undefined && !stLayout) {
       error = SC.Error.desc(("%@.layout() cannot use height:auto if "+
                "staticLayout is disabled").fmt(this),"%@".fmt(this), -1);
       console.error(error.toString())  ;
      throw error ;
    }

    if (stLayout) {
      // need layer to be able to compute rect
      if (layer = this.get('layer')) {
        f = SC.viewportOffset(layer); // x,y
        if (pv) f = pv.convertFrameFromView(f, null);

        /*
          TODO Can probably have some better width/height values - CC
        */
        f.width = layer.offsetWidth;
        f.height = layer.offsetHeight;
        return f;
      }
      return null; // can't compute
    }


    if (!pdim) pdim = this.computeParentDimensions(layout) ;
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)){
        f.x = dW*lL;
      }else{
        f.x = lL ;
      }
      if (lW !== undefined) {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = lW ;
      } else { // better have lR!
        f.width = dW - f.x ;
        if(lR && SC.isPercentage(lR)) f.width = f.width - (lR*dW) ;
        else f.width = f.width - (lR || 0) ;
      }
    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW*lR) ;
        }
        else f.width = dW - lR ;
        f.x = 0 ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = (lW || 0) ;
        if (SC.isPercentage(lW)) f.x = dW - (lR*dW) - f.width ;
        else f.x = dW - lR - f.width ;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW === AUTO) f.width = AUTO ;
      else if (SC.isPercentage(lW)) f.width = lW*dW ;
      else f.width = (lW || 0) ;
      if(SC.isPercentage(lcX)) f.x = (dW - f.width)/2 + (lcX*dW) ;
      else f.x = (dW - f.width)/2 + lcX ;
    } else {
      f.x = 0 ; // fallback
      if (SC.none(lW)) {
        f.width = dW ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        if (SC.isPercentage(lW)) f.width = lW*dW ;
        else f.width = (lW || 0) ;
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) f.y = lT*dH ;
      else f.y = lT ;
      if (lH !== undefined) {
        if(lH === AUTO) f.height = AUTO ;
        else if(SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH ;
      } else { // better have lB!
        if(lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB*dH) ;
        else f.height = dH - f.y - (lB || 0) ;
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB*dH) ;
        else f.height = dH - lB ;
        f.y = 0 ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = (lH || 0) ;
        if (SC.isPercentage(lB)) f.y = dH - (lB*dH) - f.height ;
        else f.y = dH - lB - f.height ;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH === AUTO) f.height = AUTO ;
      if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
      else f.height = (lH || 0) ;
      if (SC.isPercentage(lcY)) f.y = (dH - f.height)/2 + (lcY*dH) ;
      else f.y = (dH - f.height)/2 + lcY ;

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(lH)) {
        f.height = dH ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH || 0 ;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if(f.height !== AUTO) f.height = Math.floor(f.height);
    if(f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    // views with SC.Border mixin applied applied
    if (this.get('hasBorder')) {
      borderTop = this.get('borderTop');
      borderLeft = this.get('borderLeft');
      f.height -= borderTop+this.get('borderBottom');
      f.y += borderTop;
      f.width -= borderLeft+this.get('borderRight');
      f.x += borderLeft;
    }

    // Account for special cases inside ScrollView, where we adjust the
    // element's scrollTop/scrollLeft property for performance reasons.
    if (pv && pv.isScrollContainer) {
      pv = pv.get('parentView');
      f.x -= pv.get('horizontalScrollOffset');
      f.y -= pv.get('verticalScrollOffset');
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
    account the contentClippingFrame of the parent view.  Keep in mind that
    the clippingFrame is in the context of the view itself, not it's parent
    view.

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's contentClippingFrame.

    @property {Rect}
  */
  clippingFrame: function() {
    var f = this.get('frame'),
        ret = f,
        pv, cf;

    if (!f) return null;
    pv = this.get('parentView');
    if (pv) {
      cf = pv.get('contentClippingFrame');
      if (!cf) return f;
      ret = SC.intersectRects(cf, f);
    }
    ret.x -= f.x;
    ret.y -= f.y;

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /**
    The clipping frame child views should intersect with.  Normally this is
    the same as the regular clippingFrame.  However, you may override this
    method if you want the child views to actually draw more or less content
    than is actually visible for some reason.

    Usually this is only used by the ScrollView to optimize drawing on touch
    devices.

    @property {Rect}
  */
  contentClippingFrame: function() {
    return this.get('clippingFrame');
  }.property('clippingFrame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_view_clippingFrameDidChange: function() {
    var cvs = this.get('childViews'), len = cvs.length, idx, cv ;
    for (idx=0; idx<len; ++idx) {
      cv = cvs[idx] ;

      // In SC 1.0 views with static layout did not receive notifications
      // of frame changes because they didn't support frames.  In SC 1.1 they
      // do support frames, so they should receive notifications.  Also in
      // SC 1.1 SC.StaticLayout is merged into SC.View.  The mixin is only
      // for compatibility.  This property is defined on the mixin.
      //
      // frame changes should be sent all the time unless this property is
      // present to indicate that we want the old 1.0 API behavior instead.
      //
      if (!cv.useStaticLayout) {
        cv.notifyPropertyChange('clippingFrame') ;
        cv._sc_view_clippingFrameDidChange();
      }
    }
  },

  /**
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.

    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function() {
    var frameMayHaveChanged, layout, isFixed, isPercentageFunc, isPercentage;

    // If this view uses static layout, our "do we think the frame changed?"
    // logic is not applicable and we simply have to assume that the frame may
    // have changed.
    if (this.useStaticLayout) {
      frameMayHaveChanged = YES;
    }
    else {
      layout = this.get('layout');

      // only resizes if the layout does something other than left/top - fixed
      // size.
      isFixed = (
        (layout.left !== undefined) && (layout.top !== undefined) &&
        (layout.width !== undefined) && (layout.height !== undefined)
      );


      // If it's fixed, our frame still could have changed if it's fixed to a
      // percentage of the parent.
      if (isFixed) {
        isPercentageFunc = SC.isPercentage;
        isPercentage = (isPercentageFunc(layout.left) ||
                        isPercentageFunc(layout.top) ||
                        isPercentageFunc(layout.width) ||
                        isPercentageFunc(layout.right) ||
                        isPercentageFunc(layout.centerX) ||
                        isPercentageFunc(layout.centerY));
      }

      frameMayHaveChanged = (!isFixed || isPercentage);
    }

    // Do we think there's a chance our frame will have changed as a result?
    if (frameMayHaveChanged) {
      // There's a chance our frame changed.  Invoke viewDidResize(), which
      // will notify about our change to 'frame' (if it actually changed) and
      // appropriately notify our child views.
      this.viewDidResize();
    }
  },



  /**
    This method is invoked on your view when the view resizes due to a layout
    change or potentially due to the parent view resizing (if your view’s size
    depends on the size of your parent view).  You can override this method
    to implement your own layout if you like, such as performing a grid
    layout.

    The default implementation simply notifies about the change to 'frame' and
    then calls parentViewDidResize on all of your children.

    @returns {void}
  */
  viewDidResize: function() {
    this._viewFrameDidChange();

    // Also notify our children.
    var cv = this.childViews, len, idx, view ;
    for (idx=0; idx<(len= cv.length); ++idx) {
      view = cv[idx];
      view.parentViewDidResize();
    }
  },

  /** @private
    Invoked by other views to notify this view that its frame has changed.

    This notifies the view that its frame property has changed,
    then propagates those changes to its child views.
  */
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
    this._sc_view_clippingFrameDidChange();
  },

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
    Setting wantsAcceleratedLayer to YES will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function(){
    return this.get('wantsAcceleratedLayer') && SC.platform.supportsAcceleratedLayers;
  }.property('wantsAcceleratedLayer').cacheable(),


  /**
    layoutStyle describes the current styles to be written to your element
    based on the layout you defined.  Both layoutStyle and frame reset when
    you edit the layout property.  Both are read only.

    Computes the layout style settings needed for the current anchor.

    @property {Hash}
    @readOnly
  */


  layoutStyle: function() {
    var layout = this.get('layout'), ret = {}, pdim = null, error,
        AUTO = SC.LAYOUT_AUTO,
        dims = SC._VIEW_DEFAULT_DIMS, loc = dims.length, x, value, key,
        stLayout = this.get('useStaticLayout'),
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lMW = layout.maxWidth,
        lMH = layout.maxHeight,
        lcX = layout.centerX,
        lcY = layout.centerY,
        canUseAcceleratedLayer = this.get('hasAcceleratedLayer'),
        translateTop = null,
        translateLeft = null;
    if (lW !== undefined && lW === SC.LAYOUT_AUTO && !stLayout) {
      error= SC.Error.desc("%@.layout() you cannot use width:auto if ".fmt(this) +
              "staticLayout is disabled","%@".fmt(this),-1);
      console.error(error.toString()) ;
      throw error ;
    }

    if (lH !== undefined && lH === SC.LAYOUT_AUTO && !stLayout) {
      error = SC.Error.desc("%@.layout() you cannot use height:auto if ".fmt(this) +
                "staticLayout is disabled","%@".fmt(this),-1);
      console.error(error.toString()) ;
      throw error ;
    }

    if (SC.platform.supportsCSSTransforms) {
      // Check to see if we're using transforms
      var animatingTransforms = NO, transformAnimationDuration;
      for(key in layout){
        if (key.substring(0,7) === 'animate') {
          if (SC.CSS_TRANSFORM_MAP[key.substring(7).camelize()]) {
            animatingTransforms = YES;

            if (this._pendingAnimations && this._pendingAnimations['-'+SC.platform.cssPrefix+'-transform']) {
              throw "Animations of transforms must be executed simultaneously!";
            }

            // TODO: If we want to allow it to be set as just a number for duration we need to add support here
            if (transformAnimationDuration && layout[key].duration !== transformAnimationDuration) {
              console.warn("Can't animate transforms with different durations! Using first duration specified.");
              layout[key].duration = transformAnimationDuration;
            }
            transformAnimationDuration = layout[key].duration;

            // FIXME: There will also be problems if we have conflicting timings and callbacks
          }
        }
      }

      // If we're animating other transforms at different speeds, don't use acceleratedLayer
      if (
        animatingTransforms &&
        (
          (layout['animateTop'] && layout['animateTop'].duration !== transformAnimationDuration) ||
          (layout['animateLeft'] && layout['animateLeft'].duration !== transformAnimationDuration)
        )
      ) {
        canUseAcceleratedLayer = NO;
      }
    }

    // X DIRECTION

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) {
        ret.left = (lL*100)+"%";  //percentage left
      } else if (canUseAcceleratedLayer && !SC.empty(lW)) {
        translateLeft = Math.floor(lL);
        ret.left = 0;
      } else {
        ret.left = Math.floor(lL); //px left
      }
      ret.marginLeft = 0 ;

      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = (lW*100)+"%"; //percentage width
        else ret.width = Math.floor(lW) ; //px width
        ret.right = null ;
      } else {
        ret.width = null ;
        if(lR && SC.isPercentage(lR)) ret.right = (lR*100)+"%"; //percentage right
        else ret.right = Math.floor(lR || 0) ; //px right
      }

    // handle right aligned
    } else if (!SC.none(lR)) {
      if(SC.isPercentage(lR)) {
        ret.right = Math.floor(lR*100)+"%";  //percentage left
      }else{
        ret.right = Math.floor(lR) ;
      }
      ret.marginLeft = 0 ;

      if (SC.none(lW)) {
        if (SC.none(lMW)) ret.left = 0;
        ret.width = null;
      } else {
        ret.left = null ;
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(lW && SC.isPercentage(lW)) ret.width = (lW*100)+"%" ; //percentage width
        else ret.width = Math.floor(lW || 0) ; //px width
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      ret.left = "50%";
      if(lW && SC.isPercentage(lW)) ret.width = (lW*100)+"%" ; //percentage width
      else ret.width = Math.floor(lW || 0) ;
      if(lW && SC.isPercentage(lW) && (SC.isPercentage(lcX) || SC.isPercentage(lcX*-1))){
        ret.marginLeft = Math.floor((lcX - lW/2)*100)+"%" ;
      }else if(lW && lW >= 1 && !SC.isPercentage(lcX)){
        ret.marginLeft = Math.floor(lcX - ret.width/2) ;
      }else {
        // This error message happens whenever width is not set.
        console.warn("You have to set width and centerX using both percentages or pixels");
        ret.marginLeft = "50%";
      }
      ret.right = null ;

    // if width defined, assume top/left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      ret.right = null;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else if(SC.isPercentage(lW)) ret.width = (lW*100)+"%";
      else ret.width = Math.floor(lW);
      ret.marginLeft = 0;

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.right = 0;
      ret.width = null ;
      ret.marginLeft= 0;
    }


    // handle min/max
    ret.minWidth = (layout.minWidth === undefined) ? null : layout.minWidth ;
    ret.maxWidth = (layout.maxWidth === undefined) ? null : layout.maxWidth ;

    // Y DIRECTION

    // handle top aligned and left/right
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) {
        ret.top = (lT*100)+"%";
      } else if (canUseAcceleratedLayer && !SC.empty(lH)) {
        translateTop = Math.floor(lT);
        ret.top = 0;
      } else {
        ret.top = Math.floor(lT);
      }
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
        else ret.height = Math.floor(lH) ;
        ret.bottom = null ;
      } else {
        ret.height = null ;
        if(lB && SC.isPercentage(lB)) ret.bottom = (lB*100)+"%" ;
        else ret.bottom = Math.floor(lB || 0) ;
      }
      ret.marginTop = 0 ;

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      ret.marginTop = 0 ;
      if(SC.isPercentage(lB)) ret.bottom = (lB*100)+"%";
      else ret.bottom = Math.floor(lB) ;
      if (SC.none(lH)) {
        if (SC.none(lMH)) ret.top = 0;
        ret.height = null ;
      } else {
        ret.top = null ;
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
        else ret.height = Math.floor(lH || 0) ;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      ret.top = "50%";
      ret.bottom = null ;

      if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+ "%" ;
      else ret.height = Math.floor(lH || 0) ;

      if(lH && SC.isPercentage(lH) && (SC.isPercentage(lcY) || SC.isPercentage(lcY*-1))){ //height is percentage and lcy too
        ret.marginTop = Math.floor((lcY - lH/2)*100)+"%" ;
      }else if(lH && lH >= 1 && !SC.isPercentage(lcY)){
        ret.marginTop = Math.floor(lcY - ret.height/2) ;
      }else {
        console.warn("You have to set height and centerY to use both percentages or pixels");
        ret.marginTop = "50%";
      }
    } else if (!SC.none(lH)) {
      ret.top = 0;
      ret.bottom = null;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if(lH && SC.isPercentage(lH)) ret.height = (lH*100)+"%" ;
      else ret.height = Math.floor(lH || 0) ;
      ret.marginTop = 0;

    // fallback, full width.
    } else {
      ret.top = 0;
      ret.bottom = 0;
      ret.height = null ;
      ret.marginTop= 0;
    }

    // handle min/max
    ret.minHeight = (layout.minHeight === undefined) ?
      null :
      layout.minHeight ;
    ret.maxHeight = (layout.maxHeight === undefined) ?
      null :
      layout.maxHeight ;

    // if zIndex is set, use it.  otherwise let default shine through
    ret.zIndex = SC.none(layout.zIndex) ? null : layout.zIndex.toString();

    // if opacity is set, use it. otherwise let default shine through
    ret.opacity = SC.none(layout.opacity) ? null : layout.opacity.toString();
    ret.mozOpacity = ret.opacity; // older Firefox?

    // if backgroundPosition is set, use it.
    // otherwise let default shine through
    ret.backgroundPosition = SC.none(layout.backgroundPosition) ?
      null :
      layout.backgroundPosition.toString() ;

    // set default values to null to allow built-in CSS to shine through
    // currently applies only to marginLeft & marginTop
    while(--loc >=0) {
      x = dims[loc];
      if (ret[x]===0) ret[x]=null;
    }

    if (SC.platform.supportsCSSTransforms) {
      // Handle transforms
      var transformAttribute = SC.platform.domCSSPrefix+'Transform',
          layer = this.get('layer'),
          // FIXME: This is not the best way to do it, we should track these locally
          currentTransforms = (layer ? layer.style[transformAttribute] : '').split(' '),
          cleanedTransforms = [], halTransforms, specialTransforms = [], transformName, idx;

      if (canUseAcceleratedLayer) {
        // Remove old translates
        for(idx=0; idx < currentTransforms.length; idx++) {
          if (currentTransforms[idx].substring(0,9) !== 'translate') {
            cleanedTransforms.push(currentTransforms[idx]);
          }
        }
        currentTransforms = cleanedTransforms;

        halTransforms = ['translateX('+(translateLeft || 0)+'px)', 'translateY('+(translateTop || 0)+'px)'];

        // FIXME: This join.match is a bit hackish
        if (SC.platform.supportsCSS3DTransforms && !currentTransforms.join(' ').match('translateZ')) {
          halTransforms.push('translateZ(0px)');
        }
      }

      // Handle special CSS transform attributes
      for(transformName in SC.CSS_TRANSFORM_MAP) {
        cleanedTransforms = [];
        for(idx=0; idx < currentTransforms.length; idx++) {
          if (!currentTransforms[idx].match(new RegExp('^'+transformName+'\\\('))) {
            cleanedTransforms.push(currentTransforms[idx]);
          }
        }
        currentTransforms = cleanedTransforms;

        if (layout[transformName]) {
          specialTransforms.push(SC.CSS_TRANSFORM_MAP[transformName](layout[transformName]));
        }
      }
      specialTransforms = specialTransforms.join(' ');

      var allTransforms = currentTransforms.concat(halTransforms, specialTransforms).without(undefined).without('').join(' ');

      // Set transform attribute
      if (allTransforms !== '') ret[transformAttribute] = allTransforms;
    }

    // Temporary fix to not break SC.Animatable
    if (!this.isAnimatable) {

      // Handle animations
      var transitions = [], animation, propertyKey;
      this._animatedTransforms = [];

      for(key in layout) {
        if (key.substring(0,7) === 'animate') {
          // FIXME: If we want to allow it to be set as just a number for duration we need to add support here
          animation = layout[key];

          if (animation.timing) {
            if (SC.typeOf(animation.timing) != SC.T_STRING) {
              animation.timing = "cubic-bezier("+animation.timing[0]+", "+animation.timing[1]+", "+
                                                 animation.timing[2]+", "+animation.timing[3]+")";
            }
          } else {
            animation.timing = 'linear';
          }

          propertyKey = key.substring(7).camelize();

          // TODO: This is a weird conditional, we can probably clean it up
          if (
            SC.platform.supportsCSSTransforms &&
            (
              (
                canUseAcceleratedLayer && (
                  (propertyKey === 'top' && !SC.empty(translateTop)) ||
                  (propertyKey === 'left' && !SC.empty(translateLeft))
                )
              ) ||
              SC.CSS_TRANSFORM_MAP[propertyKey]
            )
          ) {
            this._animatedTransforms.push(propertyKey);
            propertyKey = '-'+SC.platform.cssPrefix+'-transform';
          }

          animation.css = propertyKey + " " + animation.duration + "s " + animation.timing;

          // If it's a transform this may have already been set
          if (!this._pendingAnimations) this._pendingAnimations = {};
          if (!this._pendingAnimations[propertyKey]) {
            this._pendingAnimations[propertyKey] = animation;
            transitions.push(animation.css);
          }
        }
      }

      if (SC.platform.supportsCSSTransitions) ret[SC.platform.domCSSPrefix+"Transition"] = transitions.length > 0 ? transitions.join(", ") : null;

    }


    // convert any numbers into a number + "px".
    for(key in ret) {
      value = ret[key];
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

    Implementation Note:  In a traditional setup, we would simply observe
    'layout' here, but as described above in the documentation for our custom
    implementation of propertyDidChange(), this method must always run
    immediately after 'layout' is updated to avoid the potential for stale
    (incorrect) cached 'frame' values.

    @returns {SC.View} receiver
  */
  layoutDidChange: function() {
    // Did our layout change in a way that could cause us to be resized?  If
    // not, then there's no need to invalidate the frames of our child views.
    var previousLayout = this._previousLayout,
        currentLayout  = this.get('layout'),
        didResize      = YES,
        previousWidth, previousHeight, currentWidth, currentHeight;


    // Handle old style rotation
    if (!SC.none(currentLayout.rotate)) {
      if (SC.none(currentLayout.rotateX)) {
        currentLayout.rotateX = currentLayout.rotate;
        console.warn('Please set rotateX instead of rotate');
      }
    }
    if (!SC.none(currentLayout.rotateX)) {
      currentLayout.rotate = currentLayout.rotateX;
    } else {
      delete currentLayout.rotate;
    }

    if (!SC.none(currentLayout.animateRotate)) {
      if (SC.none(currentLayout.animateRotateX)) {
        currentLayout.animateRotateX = currentLayout.animateRotate;
        console.warn('Please set animateRotateX instead of animateRotate');
      }
    }
    if (!SC.none(currentLayout.animateRotateX)) {
      currentLayout.animateRotate = currentLayout.animateRotateX;
    } else {
      delete currentLayout.animateRotate;
    }


    if (previousLayout  &&  previousLayout !== currentLayout) {
      // This is a simple check to see whether we think the view may have
      // resized.  We could look for a number of cases, but for now we'll
      // handle only one simple case:  if the width and height are both
      // specified, and they have not changed.
      previousWidth = previousLayout.width;
      if (previousWidth !== undefined) {
        currentWidth = currentLayout.width;
        if (previousWidth === currentWidth) {
          previousHeight = previousLayout.height;
          if (previousLayout !== undefined) {
            currentHeight = currentLayout.height;
            if (previousHeight === currentHeight) didResize = NO;
          }
        }
      }
    }

    this.beginPropertyChanges() ;
    this.notifyPropertyChange('layoutStyle') ;
    if (didResize) {
      this.viewDidResize();
    }
    else {
      // Even if we didn't resize, our frame might have changed.
      // viewDidResize() handles this in the other case.
      this._viewFrameDidChange();
    }
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

    this._previousLayout = currentLayout;

    return this ;
  },

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
    if (!set) set = this._needLayoutViews = SC.CoreSet.create();
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
    var set = this._needLayoutViews,
        len = set ? set.length : 0,
        i;
    for (i = 0; i < len; ++i) {
      set[i].updateLayout();
    }
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
      this.renderLayout(context, NO);
      context.update();

      // If this view uses static layout, then notify if the frame changed.
      // (viewDidResize will do a comparison)
      if (this.useStaticLayout) this.viewDidResize();
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
    this._scv_willRenderAnimations();
    context.addStyle(this.get('layoutStyle'));
    this._scv_didRenderAnimations();
  },

  /** walk like a duck */
  isView: YES,

  /**
    Default method called when a selectstart event is triggered. This event is
    only supported by IE. Used in sproutcore to disable text selection and
    IE8 accelerators. The accelerators will be enabled only in
    text selectable views. In FF and Safari we use the css style 'allow-select'.

    If you want to enable text selection in certain controls is recommended
    to override this function to always return YES , instead of setting
    isTextSelectable to true.

    For example in textfield you dont want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.

    @param evt {SC.Event} the selectstart event
    @returns YES if selectable
  */
  selectStart: function(evt) {
    return this.get('isTextSelectable');
  },

  /**
    Used to block the contextMenu per view.

    @param evt {SC.Event} the contextmenu event
    @returns YES if the contextmenu can show up
  */
  contextMenu: function(evt) {
    if(!this.get('isContextMenuEnabled')) evt.stop();
    return true;
  },

  /**
    A boundary set of distances outside which the touch will not be considered "inside" the view anymore.

    By default, up to 50px on each side.
  */
  touchBoundary: { left: 50, right: 50, top: 50, bottom: 50 },

  /**
    @private
    A computed property based on frame.
  */
  _touchBoundaryFrame: function (){
    return this.get("parentView").convertFrameToView(this.get('frame'), null);
  }.property("frame", "parentView").cacheable(),

  /**
    Returns YES if the provided touch is within the boundary.
  */
  touchIsInBoundary: function(touch) {
    var f = this.get("_touchBoundaryFrame"), maxX = 0, maxY = 0, boundary = this.get("touchBoundary");
    var x = touch.pageX, y = touch.pageY;

    if (x < f.x) {
      x = f.x - x;
      maxX = boundary.left;
    } else if (x > f.x + f.width) {
      x = x - (f.x + f.width);
      maxX = boundary.right;
    } else {
      x = 0;
      maxX = 1;
    }

    if (y < f.y) {
      y = f.y - y;
      maxY = boundary.top;
    } else if (y > f.y + f.height) {
      y = y - (f.y + f.height);
      maxY = boundary.bottom;
    } else {
      y = 0;
      maxY = 1;
    }

    if (x > 100 || y > 100) return NO;
    return YES;
  },

  ///
  /// BUILDING IN/OUT
  ///

  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.
  */
  buildInChild: function(view) {
    view.willBuildInToView(this);
    this.appendChild(view);
    view.buildInToView(this);
  },

  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.
  */
  buildOutChild: function(view) {
    view.buildOutFromView(this);
  },

  /**
    Called by child view when build in finishes. By default, does nothing.

  */
  buildInDidFinishFor: function(child) {
  },

  /**
    @private
    Called by child view when build out finishes. By default removes the child view.
  */
  buildOutDidFinishFor: function(child) {
    this.removeChild(child);
  },

  /**
    Whether the view is currently building in.
  */
  isBuildingIn: NO,

  /**
    Whether the view is currently building out.
  */
  isBuildingOut: NO,

  /**
    Implement this, and call didFinishBuildIn when you are done.
  */
  buildIn: function() {
    this.buildInDidFinish();
  },

  /**
    Implement this, and call didFinsihBuildOut when you are done.
  */
  buildOut: function() {
    this.buildOutDidFinish();
  },

  /**
    This should reset (without animation) any internal states; sometimes called before.

    It is usually called before a build in, by the parent view.
  */
  resetBuild: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.

    This is basically called whenever build in happens.
  */
  buildOutDidCancel: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?

    If build in was cancelled, it means build out is probably happening.
    So, any timers or anything you had going, you can cancel.
    Then buildOut will happen.
  */
  buildInDidCancel: function() {

  },

  /**
    Call this when you have built in.
  */
  buildInDidFinish: function() {
    this.isBuildingIn = NO;
    this._buildingInTo.buildInDidFinishFor(this);
    this._buildingInTo = null;
  },

  /**
    Call this when you have finished building out.
  */
  buildOutDidFinish: function() {
    this.isBuildingOut = NO;
    this._buildingOutFrom.buildOutDidFinishFor(this);
    this._buildingOutFrom = null;
  },

  /**
    Usually called by parentViewDidChange, this resets the build state (calling resetBuild in the process).
  */
  resetBuildState: function() {
    if (this.isBuildingIn) {
      this.buildInDidCancel();
      this.isBuildingIn = NO;
    }
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
      this.isBuildingOut = NO;
    }

    // finish cleaning up
    this.buildingInTo = null;
    this.buildingOutFrom = null;

    this.resetBuild();
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method. This prepares
    to build in, but unlike buildInToView, this is called _before_ the child
    is appended.

    Mostly, this cancels any build out _before_ the view is removed through parent change.
  */
  willBuildInToView: function(view) {
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
    }
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function(view) {
    // if we are already building in, do nothing.
    if (this.isBuildingIn) return;

    this._buildingInTo = view;
    this.isBuildingOut = NO;
    this.isBuildingIn = YES;
    this.buildIn();
  },

  /**
    @private (semi)
    Called by building parent view's buildOutChild method.

    The supplied view should always be the parent view.
  */
  buildOutFromView: function(view) {
    // if we are already building out, do nothing.
    if (this.isBuildingOut) return;

    // cancel any build ins
    if (this.isBuildingIn) {
      this.buildInDidCancel();
    }

    // in any case, we need to build out
    this.isBuildingOut = YES;
    this.isBuildingIn = NO;
    this._buildingOutFrom = view;
    this.buildOut();
  }
});

SC.View.mixin(/** @scope SC.View */ {

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
    Convert any layout to a Top, Left, Width, Height layout
  */
  convertLayoutToAnchoredLayout: function(layout, parentFrame){
    var ret = {top: 0, left: 0, width: parentFrame.width, height: parentFrame.height},
        pFW = parentFrame.width, pFH = parentFrame.height, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    // X Conversion
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) ret.left = lL*pFW;
      else ret.left = lL;
      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = lW*pFW ;
        else ret.width = lW ;
      } else {
        if (lR && SC.isPercentage(lR)) ret.width = pFW - ret.left - (lR*pFW);
        else ret.width = pFW - ret.left - (lR || 0);
      }

    // handle right aligned
    } else if (!SC.none(lR)) {

      // if no width, calculate it from the parent frame
      if (SC.none(lW)) {
        ret.left = 0;
        if(lR && SC.isPercentage(lR)) ret.width = pFW - (lR*pFW);
        else ret.width = pFW - (lR || 0);

      // If has width, calculate the left anchor from the width and right and parent frame
      } else {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lW)) ret.width = lW*pFW;
          else ret.width = lW;
          if (SC.isPercentage(lR)) ret.left = pFW - (ret.width + lR);
          else ret.left = pFW - (ret.width + lR);
        }
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW && SC.isPercentage(lW)) ret.width = (lW*pFW) ;
      else ret.width = (lW || 0) ;
      ret.left = ((pFW - ret.width)/2);
      if (SC.isPercentage(lcX)) ret.left = ret.left + lcX*pFW;
      else ret.left = ret.left + lcX;

    // if width defined, assume left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else {
        if(SC.isPercentage(lW)) ret.width = lW*pFW;
        else ret.width = lW;
      }

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.width = 0;
    }

    // handle min/max
    if (layout.minWidth !== undefined) ret.minWidth = layout.minWidth ;
    if (layout.maxWidth !== undefined) ret.maxWidth = layout.maxWidth ;

    // Y Conversion
    // handle left aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) ret.top = lT*pFH;
      else ret.top = lT;
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if (SC.isPercentage(lH)) ret.height = lH*pFH;
        else ret.height = lH ;
      } else {
        ret.height = pFH - ret.top;
        if(lB && SC.isPercentage(lB)) ret.height = ret.height - (lB*pFH);
        else ret.height = ret.height - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {

      // if no height, calculate it from the parent frame
      if (SC.none(lH)) {
        ret.top = 0;
        if (lB && SC.isPercentage(lB)) ret.height = pFH - (lB*pFH);
        else ret.height = pFH - (lB || 0);

      // If has height, calculate the top anchor from the height and bottom and parent frame
      } else {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lH)) ret.height = lH*pFH;
          else ret.height = lH;
          ret.top = pFH - ret.height;
          if (SC.isPercentage(lB)) ret.top = ret.top - (lB*pFH);
          else ret.top = ret.top - lB;
        }
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH && SC.isPercentage(lH)) ret.height = (lH*pFH) ;
      else ret.height = (lH || 0) ;
      ret.top = ((pFH - ret.height)/2);
      if(SC.isPercentage(lcY)) ret.top = ret.top + lcY*pFH;
      else ret.top = ret.top + lcY;

    // if height defined, assume top of zero
    } else if (!SC.none(lH)) {
      ret.top =  0;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if (SC.isPercentage(lH)) ret.height = lH*pFH;
      else ret.height = lH;

    // fallback, full height.
    } else {
      ret.top = 0;
      ret.height = 0;
    }

    if(ret.top) ret.top = Math.floor(ret.top);
    if(ret.bottom) ret.bottom = Math.floor(ret.bottom);
    if(ret.left) ret.left = Math.floor(ret.left);
    if(ret.right) ret.right = Math.floor(ret.right);
    if(ret.width !== SC.LAYOUT_AUTO) ret.width = Math.floor(ret.width);
    if(ret.height !== SC.LAYOUT_AUTO) ret.height = Math.floor(ret.height);

    // handle min/max
    if (layout.minHeight !== undefined) ret.minHeight = layout.minHeight ;
    if (layout.maxHeight !== undefined) ret.maxHeight = layout.maxHeight ;

    return ret;
  },

  /**
    For now can only convert Top/Left/Width/Height to a Custom Layout
  */
  convertLayoutToCustomLayout: function(layout, layoutParams, parentFrame){
    // TODO: [EG] Create Top/Left/Width/Height to a Custom Layout conversion
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
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
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
    if (rootElement) attrs.rootElement = SC.$(rootElement)[0];
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
    } else args[0] = { rootElement: SC.$(element)[0] } ;
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
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while(--idx>=0) {
      viewClass = childViews[idx];
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
SC.outlet = function(path, root) {
  return function(key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this)) ;
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

SC.View.runCallback = function(callback){
  var additionalArgs = SC.$A(arguments).slice(1),
      typeOfAction = SC.typeOf(callback.action);

  // if the action is a function, just try to call it.
  if (typeOfAction == SC.T_FUNCTION) {
    callback.action.apply(callback.target, additionalArgs);

  // otherwise, action should be a string.  If it has a period, treat it
  // like a property path.
  } else if (typeOfAction === SC.T_STRING) {
    if (callback.action.indexOf('.') >= 0) {
      var path = callback.action.split('.') ;
      var property = path.pop() ;

      var target = SC.objectForPropertyPath(path, window) ;
      var action = target.get ? target.get(property) : target[property];
      if (action && SC.typeOf(action) == SC.T_FUNCTION) {
        action.apply(target, additionalArgs);
      } else {
        throw 'SC.runCallback could not find a function at %@'.fmt(callback.action) ;
      }

    // otherwise, try to execute action direction on target or send down
    // responder chain.
    // FIXME: Add support for additionalArgs to this
    // } else {
    //  SC.RootResponder.responder.sendAction(callback.action, callback.target, callback.source, callback.source.get("pane"), null, callback.source);
    }
  }
};


//unload views for IE, trying to collect memory.
if(SC.browser.msie) SC.Event.add(window, 'unload', SC.View, SC.View.unload) ;


