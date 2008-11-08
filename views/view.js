// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/system/browser');
require('foundation/mixins/delegate_support') ;
require('foundation/mixins/string') ;

require('foundation/system/object') ;

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

  concatenatedProperties: ['outlets'],
  
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
    if (view.parentNode != this) {
      throw "%@.removeChild(%@) must belong to parent".fmt(this,view);
    }

    // notify views
    if (view.willRemoveFromParent) view.willRemoveFromParent() ;
    if (this.willRemoveChild) this.willRemoveChild(view) ;

    // update parent node
    view.set('parentNode', null) ;
    
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
    return this.appendChild(view);
  },
    
  /** 
    This method is called on a view whenever it's location in the display
    hierarchy changes.  It will register the view to update its DOM location
    at the end of the runloop.
  */
  displayLocationDidChange: function() {
    this.set('displayLocationNeedsUpdate', YES) ;
    SC.runLoop.viewDisplayLocationNeedsUpdate(this) ;
    return this ;
  },
  
  /**
    This method will update the display location, but only if it needs an 
    update.  
  */
  updateDisplayLocationIfNeeded: function() {
    if (!this.get('displayLocationNeedsUpdate')) return this;
    this.set('displayLocationNeedsUpdate', NO) ;
    return this.updateDisplayLocation() ;
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
    return this ; 
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
    this.rootElement = this.containerElement = null ;
    
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
    if (loc>0) views = [] ; // only create if needed to avoid memory
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
      if (!this._cachedEmptyElement) {
        var html = this.get('emptyElement');
        this.constructor.prototype._cachedEmptyElement = SC.View.generateElement(html) ;
      }
      root = this._cachedEmptyElement.cloneNode(true);
      
    // otherwise, we can't cache the DOM because it is overridden by instance
    } else {
      var html = this.get('emptyElement');
      root = SC.View.generateElement(html) ;
    }
    this.rootElement = root ;
    
    // save this guid on the DOM element for reverse lookups.
    if (root) root[SC.guidKey] = SC.guidFor(this) ;
    
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
  
  containerElement: null,
  
  emptyElement: '<div class="sc-view"></div>'  
  
}); 

SC.View.mixin(/** @scope SC.View @static */ {

  /** 
    Returns a new view builder.  The builder can collect properties to apply
    to the view when it is created.

    @param {Hash} attrs to apply to view
    @param {Array} path to DOM element in parent, if known
    @returns {Builder} builder object.
  */
  build: function(attrs, path) {
    // get the new object
    var ret= SC.beget(SC.View.build.fn) ;
    ret.viewClass = this ; 
    ret.attrs = attrs;
    ret.rootElementPath = path ;
    return ret ;
  },
  
  /**
    Called by the runloop at the end of the runloop to update any scheduled
    view queues.
  */
  flushPendingQueues: function() {
    var queue, methodName, queues = this._queues, names = this._queueOrder ;
    var idx, hasQueues = YES, len = queues.length;
    
    // loop through the queues and process them.  Keep doing this until there
    // are no more views left in the queue.  This way if one view causes 
    // another one to need an update, they will all get processed.
    while(hasQueues) {
      hasQueues = NO; // set to YES only if a queue is found and executed
      for(idx=0;idx<len;idx++) {
        var methodName = names[idx]; 
        if ((queue=queues[name]) && (queue.length>0)) {
          hasQueues = YES ;
          delete queues[name] ; // remove queue 
          queue.invoke(methodName) ; // call method on all views
        }
      }
    }
    
    return this;
  },
  
  /**
    Called by view instances to add them to a queue with the specified named.
  */
  scheduleInRunLoop: function(queueName, view) {
    var queue = this._queues[queueName] ;
    if (!queue) queue = this._queues[queueName] = SC.Set.create();
    queue.add(view) ;
  },
  
  _queues: {},
  _queueOrder: [SC.DISPLAY_LOCATION_QUEUE, SC.DISPLAY_LAYOUT_QUEUE, SC.DISPLAY_UPDATE_QUEUE]
  
}) ;

SC.View.build.fn = {
  
  isViewBuilder: YES, // walk like a duck
  
  /** 
    Creates a new instance of the view based on the currently loaded config.
    This will create a new DOM element.  Add any last minute attrs here.
  */
  create: function(attrs) {
    SC.mixin(this.attrs, attrs) ;
    return this.viewClass.create(attrs) ;
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

    return this.viewClass.create(attrs) ;
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
  
} ;


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
