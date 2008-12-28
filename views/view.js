// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('system/browser');
require('system/object') ;
require('system/core_query');
require('system/event');
require('system/binding');

require('views/mixins/responder') ;
require('system/mixins/delegate_support') ;
require('system/mixins/string') ;

SC.viewKey = SC.guidKey + "_view" ;

/** @private */
SC.DISPLAY_LOCATION_QUEUE = 'updateDisplayLocationIfNeeded';

/** @private */
SC.DISPLAY_LAYOUT_QUEUE   = 'updateDisplayLayoutIfNeeded';

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

  concatenatedProperties: ['outlets','displayProperties', 'styleClass', 'updateDisplayMixin', 'prepareDisplayMixin'],
  
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
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.
  */
  parentView: null,

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
  childViews: [],
  
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
    view.parentViewDidChange() ;
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
    this.set('displayLocationNeedsUpdate', YES) ;
    this.recomputeIsVisibleInWindow() ;
    SC.View.scheduleInRunLoop(SC.DISPLAY_LOCATION_QUEUE, this);
    return this ;
  }.observes('isVisible'),
  
  /**
    Set to YES when the view's display location is dirty.  You can call 
    updateDisplayLocationIfNeeded() to clear this flag if it is set.
    
    @property {Boolean}
  */
  displayLocationNeedsUpdate: NO,
  
  /**
    Calls updateDisplayLocation(), but only if the view's display location
    currently needs to be updated.  This method is called automatically at 
    the end of a run loop if you have called parentViewDidChange() at some
    point.
    
    @property {Boolean} force This property is ignored.
    @returns {Boolean} YES if the location was updated 
  */
  updateDisplayLocationIfNeeded: function(force) {
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
    var parentNode = (parentView) ? parentView.$container().get(0) : null ;
    
    
    // if we should belong to a parent, make sure we are added to the right
    // place in the array.  Note that we assume parentNode is only non-null if
    // parentView is also non-null.
    if (parentNode) {
      var siblings = parentView.get('childViews') ;
      var nextView = siblings.objectAt(siblings.indexOf(this)+1);
      var nextNode = (nextView) ? nextView.rootElement : null ;
    
      // add to parentNode if needed.  If we do add, then also notify view
      // that its parentView has resized since joining a parentView has the
      // same effect.
      if ((node.parentNode!==parentNode) || (node.nextSibling!==nextNode)) {
        
        // before we add to parent node, make sure that the nextNode is 
        // already in the DOM.
        if (nextView && nextNode) nextView.updateDisplayLocationIfNeeded();
        
        parentNode.insertBefore(node, nextNode) ;
        this.parentViewDidResize();
      }
      
    // if we do not belong to a parent, then remove if needed.  Do not notify
    // view that parentViewDidResize since we are moving ourselves from a 
    // parentNode.  No good can come of it.
    } else {
      if (node.parentNode) node.parentNode.removeChild(node);
    }

    // finally, update visibility of element as needed if we are in a parent
    if (parentView) {
      var $ = this.$(), isVisible = this.get('isVisible') ;
      ((isVisible) ? $.show() : $.hide()); 
      if (!isVisible && this.get('isVisibleInWindow')) {
        this.recomputeIsVisibleInWindow();
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
      var childViews = this.get('childViews'), idx = childViews.length;
      while(--idx>=0) childViews[idx].recomputeIsVisibleInWindow(cur);
      
      // if we were firstResponder, resign firstResponder also
      if (!cur && this.get('isFirstResponder')) {
        this.resignFirstResponder();
      }
      
    }
    
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
    var parentView, path, root, idx, len, dp;
    
    sc_super();
    SC.View.views[SC.guidFor(this)] = this; // register w/ views
    
    // setup child views.  be sure to clone the child views array first
    this.childViews = this.childViews ? this.childViews.slice() : [];
    this.createChildViews() ; // setup child Views
    
    // if no rootElement is provided, generate the display HTML for the view.
    if (!this.rootElement) {
      
      // if a rootElementPath is provided and we have a parentView with HTML
      // already, try to find the rootElement in that template.  Otherwise,
      // generate the HTML ourselves...
      parentView = this.get('parentView');
      path = this.rootElementPath;
      root = (parentView) ? parentView.rootElement : null;      
      if (parentView && path && root) {
        idx=0; 
        len = path.length;
        while(root && idx<len) root = root.childNodes[path[idx++]];
        if (root) this.rootElement = root;
        
      } else {
        this.prepareDisplay();
        if (this.get('updateDisplayOnPrepare')) this.displayDidChange() ;
      }

      parentView = path = root = null;
    }

    // save this guid on the DOM element for reverse lookups.
    if (this.rootElement) this.rootElement[SC.viewKey] = SC.guidFor(this) ;
    
    // register display property observers .. this could be optimized into the
    // class creation mechanism if local observers did not require explicit 
    // setup.
    dp = this.get('displayProperties'); 
    idx = dp.length;
    while(--idx >= 0) {
      this.addObserver(dp[idx], this, this.displayDidChange);
    }
  },

  /**
    Wakes up the view. The default implementation immediately syncs any 
    bindings, which may cause the view to need its display updated. You 
    can override this method to perform any additional setup. Be sure to 
    call sc_super to setup bindings and to call awake on childViews.
    
    @returns {void}
  */
  awake: function() {
    sc_super();
    var childViews = this.get('childViews');
    if (childViews) childViews.invoke('awake');
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
      while(--loc >= 0) childViews[loc]._destroy() ;
    }
    
    // next remove view from global hash
    delete SC.View.views[SC.guidFor(this)];

    // can cleanup rootElement and containerElement (if set)
    delete this.rootElement; delete this._CQ;
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
    var childViews = this.get('childViews');
    var views, loc, view ;

    this.beginPropertyChanges() ;

    // swap the array
    loc = (childViews) ? childViews.length : 0 ;
    while(--loc >= 0) {
      view = childViews[loc] ;
      if (view && view.isClass) {
        view = this.createChildView(view) ; // instantiate if needed
      }
      childViews[loc] =view ;
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
    
    // try to find a matching DOM element by tracing the path
    var root = this.rootElement ;
    var path = view.prototype.rootElementPath || attrs.rootElementPath;
    var idx=0, len = (path) ? path.length : 0 ;
    while((idx<len) && root) root = root.childNodes[path[idx++]];

    if (root) attrs.rootElement = root ;
    attrs.owner = attrs.parentView = this ;
    if (!attrs.page) attrs.page = this.page ;
    
    // Now add this to the attributes and create.
    view = view.create(attrs) ;
    root = attrs = path = null  ; // clean up
    return view ;
  },
  
  /**
    This method is called when the view is created without a root element.
    You should override this method to setup the DOM according to the initial
    state of the view.  The resulting DOM will be dumped to a file and 
    reloaded during a production environment so do not depend on this method 
    being called.
    
    The default implementation will simply create DOM from the emptyElement
    property defined on the view and set it as the rootElement.  It will also
    insert any childViews DOM elements into the rootElement.
  */
  prepareDisplay: function() {
    
    //console.log('%@:prepareDisplay'.fmt(this));
    
    var root, element, html, con =this.constructor, cq, styleClass ;
    
    // if emptyElement is not overridden by the instance, then use a cached
    // DOM from the class.  Note that we don't use get() in the test below 
    // because we are interested in comparing the actual value of the 
    // property, not the output.
    var differs = SC.EMPTY_ELEMENT_PROPERTIES.find(function(k){
      return this[k] !== this.constructor.prototype[k];
    },this);    
    
    if (!differs) {
      if (!this._cachedEmptyElement || (this._emptyElementCachedForClassGuid !== SC.guidFor(con))) {
        styleClass = this.get('styleClass').join(' ');
        html = this.get('emptyElement').fmt(this.get('tagName'));
        cq = SC.$(html).addClass(styleClass);
        cq.setClass('allow-select', this.get('isTextSelectable')); 
        
        con.prototype._cachedEmptyElement = cq.get(0);        
        con.prototype._emptyElementCachedForClassGuid = SC.guidFor(con) ;
      }

      root = this._cachedEmptyElement.cloneNode(true);
      
    // otherwise, we can't cache the DOM because it is overridden by instance
    } else {
      styleClass = this.get('styleClass').join(' ');
      html = this.get('emptyElement').fmt(this.get('tagName'));
      cq = SC.$(html).addClass(styleClass);
      cq.setClass('allow-select', this.get('isTextSelectable'));
      root = cq.get(0);
    }
    this.rootElement = root ;

    // save this guid on the DOM element for reverse lookups.
    if (root) root[SC.viewKey] = SC.guidFor(this) ;
    
    // also, update the layout to match the frame
    this.updateDisplayLayout();
    
    // now add DOM for child views if needed.
    // get the containerElement or use rootElement -- append to this
    var container = this.$container().get(0);
    var idx, childViews = this.get('childViews'), max = childViews.length;
    for(idx=0;idx<max;idx++) {
      element = childViews[idx].rootElement;
      if (element) container.appendChild(element) ;
    }
    
    // clear out some local variables that hold DOM to avoid memory leaks
    root = container = element = cq = null; 

    // call all prepareDisplayMixins...
    var mixins = this.prepareDisplayMixin, len = (mixins) ? mixins.length : 0;
    for(idx=0;idx<len;idx++) mixins[idx].call(this);
  },
  
  /**
    By default, when you have to prepare the display, it will also be updated
    once even before any properties or observers are setup.  This is usually
    the behavior you want, but if you do something significantly different 
    during the prepareDisplay method, you may want to turn this off.
  */
  updateDisplayOnPrepare: YES,
  
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
  
  /**
    Returns a CoreQuery object that selects the elements starting with the 
    view's containerElement.  You can pass a selector to this or pass no 
    parameters to get a CQ object that selects the view's containerElement.
    
    For many views, their container element and root element are the same.
    This means that calling view.$() and view.$container() will yield the 
    same results.  However, if the view has a containerSelector property set, 
    then the container will differ.
  */
  $container: function(selector, context) {
    var sel = this.get('containerSelector') ;
    if (arguments.length === 0) {
      return (sel) ? this.$(sel) : this.$() ;
    } else {
      return (sel) ? this.$(selector, context || this.$(sel).get(0)) : this.$(selector,context);
    }
  },

  /**
    If you want elements inserted anywhere other than the rootElement of your
    view, you should name a selector to find the matching elements here.
  */
  containerSelector: null,

  /**
    Describe the template HTML for new elements.  This will be used to create 
    new HTML when you generate your view programatically.
  */
  emptyElement: '<%@1></%@1>',
  
  /**
    Optional tag name for the emptyElement.  Use %@1 in your empty element
    string to replace with the tag name.
  */
  tagName: 'div',
  
  /** 
    Optional css class name to add to the root element of the view when it 
    is first generated.  Use this property to bind the output HTML to some 
    CSS.
  */
  styleClass: ['sc-view'],
  
  /**
    Determines if the user can select text within the view.  Normally this is
    set to NO to disable text selection.  You should set this to YES if you
    are creating a view that includes editable text.  Otherwise, settings this
    to YES will probably make your controls harder to use and it is not 
    recommended.
    
    This property is used when first preparing the view's display.  If you
    change it once the view has been created, it will have no effect.
    
    @property {Boolean}
  */
  isTextSelectable: NO,
  
  /**
    Dumps the HTML needs for the emptyElement when restoring this view 
    hierarchy later.  This is mostly used by the view builder but may be
    useful at other times.
  */
  computeEmptyElement: function() {
    
    // make sure any pending display updates are handled -- even if offscreen
    this.performDisplayUpdates(YES); 
    
    var root = this.rootElement ;
    if (!root) return '' ;
    
    // if rootElement is in parent, remove from parent so we can place in our
    // own div.
    var parentNode = root.parentNode, next = root.nextSibling ;
    if (parentNode) parentNode.removeChild(root) ;
    
    var b = SC.$('<div></div>').append(root) ;
    var ret = b.html(); // get innerHTML

    if (parentNode) {
      parentNode.insertBefore(root, next) ;
    } else SC.$(root).remove() ;
    
    b = root = parentNode = next = null ; // avoid memory leaks
    return ret ; // return string
  },
  
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
    //console.log('%@: updateDisplay()'.fmt(this));
    
    var mixins = this.updateDisplayMixin, len = (mixins) ? mixins.length : 0;
    for(var idx=0;idx<len;idx++) mixins[idx].call(this);
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
  updateDisplayIfNeeded: function(force) {
    if (!this.get('displayNeedsUpdate')) return YES;
    if (!force & !this.get('isVisibleInWindow')) return NO ;
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
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f;

    // walk up this side
    while(next = view.get('parentView')) {
      f = next.get('frame'); myX += f.x; myY += f.y ;
      view = next ; 
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = next.get('frame'); targetX += f.x; targetY += f.y ;
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
    
    @property {Rect}
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null);
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
    var f = {} ;

    // handle left aligned and left/right 
    if (!SC.none(layout.left)) {
      f.x = Math.floor(layout.left) ;
      if (layout.width !== undefined) {
        f.width = Math.floor(layout.width) ;
      } else { // better have layout.right!
        if (!pdim) pdim = this.computeParentDimensions(layout);
        f.width = Math.floor(pdim.width - f.x - (layout.right || 0)) ;
      }
      
    // handle right aligned
    } else if (!SC.none(layout.right)) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      if (SC.none(layout.width)) {
        f.width = pdim.width - layout.right ;
        f.x = 0;
      } else {
        f.width = Math.floor(layout.width || 0) ;
        f.x = Math.floor(pdim.width - layout.right - f.width) ;
      }

    // handle centered
    } else if (!SC.none(layout.centerX)) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.width = Math.floor(layout.width || 0);
      f.x = Math.floor((pdim.width - f.width)/2 + layout.centerX);
    } else {
      f.x = 0 ; // fallback
      if (SC.none(layout.width)) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.width = Math.floor(pdim.width) ;
      } else f.width = layout.width;
    }


    // handle top aligned and top/bottom 
    if (!SC.none(layout.top)) {
      f.y = Math.floor(layout.top) ;
      if (layout.height !== undefined) {
        f.height = Math.floor(layout.height) ;
      } else { // better have layout.bottm!
        if (!pdim) pdim = this.computeParentDimensions(layout);
        f.height = Math.floor(pdim.height - f.y - (layout.bottom || 0)) ;
      }
      
    // handle bottom aligned
    } else if (!SC.none(layout.bottom)) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      if (SC.none(layout.height)) {
        f.height = pdim.height - layout.bottom;
        f.y = 0;
      } else {
        f.height = Math.floor(layout.height || 0) ;
        f.y = Math.floor(pdim.height - layout.bottom - f.height) ;
      }

    // handle centered
    } else if (!SC.none(layout.centerY)) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.height = Math.floor(layout.height || 0);
      f.y = Math.floor((pdim.height - f.height)/2 + layout.centerY);

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(layout.height)) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.height = Math.floor(pdim.height) ;
      } else f.height = layout.height;
    }

    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) f.height = layout.maxHeight;
    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) f.height = layout.minHeight;
    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) f.width = layout.maxWidth;
    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) f.width = layout.minWidth;

    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0;
    if (f.width < 0) f.width = 0;
    
    
    return f;
  },
  
  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  Keep in mind that the 
    clippingFrame is in the context of the view itself, not it's parent view.
    
    Normally this will be calculate based on the intersection of your own 
    clippignFrame and your parentView's clippingFrame.  SC.ClipView may also
    shift this by a certain amount.    
  */
  clippingFrame: function() {
    var pv= this.get('parentView'), f = this.get('frame'), ret = f ;
    if (pv) {
     pv = pv.get('clippingFrame');
     ret = SC.intersectRects(pv, f);
    }
    ret.x -= f.x; ret.y -= f.y;
    return ret ;
  }.property('parentView', 'frame').cacheable(),
  
  /** @private
    Whenever the clippingFrame changes, this observer will fire, notifying
    child views that their frames have also changed.
  */
  _view_clippingFrameDidChange: function() {
    this.get('childViews').invoke('notifyPropertyChange', 'clippingFrame');
  }.observes('clippingFrame'),
  
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

    return ret ;
  }.property().cacheable(),

  
  computeParentDimensions: function(frame) {
    var pv = this.get('parentView'), pframe = (pv) ? pv.get('frame') : null;
    return {
      width: ((pframe) ? pframe.width : ((frame.left||0)+(frame.width||0)+(frame.right||0))) || 0,
      height: ((pframe) ? pframe.height : ((frame.top||0)+(frame.height||0)+(frame.bottom||0))) || 0
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
  updateDisplayLayoutIfNeeded: function(force) {
    if (!this.get('displayLayoutNeedsUpdate')) return YES;
    if (!force && !this.get('isVisibleInWindow')) return NO ;
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
  },
  
  /**
    Force immediate update of all display-related items that are pending in
    the receiver and its child views.  If you pass YES for the force flag,
    then the display will be updated even if the view is offscreen.  This 
    will force a display if no update is needed.
    
    @param force {Boolean}
    @returns {SC.View} receiver
  */
  performDisplayUpdates: function(force) {
    this.updateDisplayLocationIfNeeded(force);
    this.updateDisplayLayoutIfNeeded(force);
    this.updateDisplayIfNeeded(force);
    
    var childViews = this.get('childViews'), loc = childViews.length;
    while(--loc>=0) childViews[loc].performDisplayUpdates(force);
    return this ;
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
    Helper applies the styleClass to the prototype
  */
  styleClass: function(sc) {
    sc = (this.prototype.styleClass || []).concat(sc);
    this.prototype.styleClass = sc;
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
    
    order: [SC.DISPLAY_LOCATION_QUEUE, SC.DISPLAY_LAYOUT_QUEUE, SC.DISPLAY_UPDATE_QUEUE]
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
    return (this[key] =  SC.objectForPropertyPath(path, this)) ;
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
