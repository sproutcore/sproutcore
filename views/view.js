// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;
require('foundation/responder') ;
require('foundation/node_descriptor') ;
require('foundation/binding');
require('foundation/path_module');

require('mixins/delegate_support') ;

SC.BENCHMARK_OUTLETS = NO ;
SC.BENCHMARK_CONFIGURE_OUTLETS = NO ;

/** 
  @class
  
  A view is the root class you use to manage the web page DOM in your
  application.  You can use views to render visible content on your page,
  provide animations, and to capture and respond to events.  

  You can use SC.View directly to manage DOM elements or you can extend one
  of the many subclasses provided by SproutCore.  This documentation describes
  the general concepts you need to understand when working with views, though
  most often you will want to work with one of the subclasses instead.
  
  h2. Working with DOM Elements
  
  h2. Handling Events
  
  @extends SC.Responder
  @extends SC.PathModule
  @extends SC.DelegateSupport
  @since SproutCore 1.0
*/
SC.View = SC.Responder.extend(SC.PathModule,  SC.DelegateSupport,
/** @scope SC.View.prototype */ {

  // ..........................................
  // VIEW API
  //
  // The methods in this section are used to manage actual views.  You can
  // basically interact with child elements in two ways.  One using an API
  // similar to the DOM API.  Alternatively, you can treat the view like an
  // array and use standard iterators.
  //

  /**
    Insert the view into the the receiver's childNodes array.
    
    The view will be added to the childNodes array before the beforeView.  If 
    beforeView is null, then the view will be added to the end of the array.  
    This will also add the view's rootElement DOM node to the receivers 
    containerElement DOM node as a child.

    If the specified view already belongs to another parent, it will be 
    removed from that view first.
    
    @param view {SC.View} the view to insert as a child node.
    @param beforeView {SC.View} view to insert before, or null to insert at 
     end
    @returns {SC.View} the receiver
  */
  insertBefore: function(view, beforeView) { 
    this._insertBefore(view,beforeView,true);
  },

  /** @private */
  _insertBefore: function(view, beforeView, updateDom) {
    // verify that beforeView is a child.
    if (beforeView) {
      if (beforeView.parentNode != this) throw "insertBefore() beforeView must belong to the receiver" ;
      if (beforeView == view) throw "insertBefore() views cannot be the same";
    }
    
    if (view.parentNode) view.removeFromParent() ;
    this.willAddChild(this, beforeView) ;
    view.willAddToParent(this, beforeView) ;
    
    // patch in the view.
    if (beforeView) {
      view.set('previousSibling', beforeView.previousSibling) ;
      view.set('nextSibling', beforeView) ;
      beforeView.set('previousSibling', view) ;      
    } else {
      view.set('previousSibling', this.lastChild) ;
      view.set('nextSibling', null) ;
      this.set('lastChild', view) ;
    }

    if (view.previousSibling) view.previousSibling.set('nextSibling',view);
    if (view.previousSibling == null) this.set('firstChild',view) ;
    view.set('parentNode', this) ;

    // Update DOM. -- ANIMATE
    // Note that this code is not called when outlets are first configured.
    // The assumption is that the created view already belongs to the 
    // document somwhere.
    if (updateDom) {
      var beforeElement = (beforeView) ? beforeView.rootElement : null;
      
      (this.containerElement || this.rootElement).insertBefore(view.rootElement,beforeElement);

      // regenerate the childNodes array.
      this._rebuildChildNodes();
    }

    // update cached states.
    view._updateIsVisibleInWindow() ;
    view._flushInternalCaches() ;
    view._invalidateClippingFrame() ;
    
    // call notices.
    view.didAddToParent(this, beforeView) ;
    this.didAddChild(view, beforeView) ;
    try{
    	return this ;
	}finally{
		if(beforeElement)
		  beforeElement=null;
	}
  },

  /**
    Remove the view from the receiver's childNodes array.  
    
    This will also remove the view's DOM element from the recievers DOM.
    
    @param view {SC.View} the view to remove
    @returns {SC.View} the receiver
  */
  removeChild: function(view) {
    if (!view) return ;
    if (view.parentNode != this) throw "removeChild: view must belong to parent";
    
    view.willRemoveFromParent() ;
    this.willRemoveChild(view) ;
    
    // unpatch.
    if (view.previousSibling) {
      view.previousSibling.set('nextSibling', view.nextSibling);
    } else this.set('firstChild', view.nextSibling) ;
    
    if (view.nextSibling) {
      view.nextSibling.set('previousSibling', view.previousSibling) ;
    } else this.set('lastChild', view.previousSibling) ;

    // Update DOM -- ANIMATE
    var el = (this.containerElement || this.rootElement);
    if (el && (view.rootElement.parentNode == el) && (el != document)) {
      el.removeChild(view.rootElement);
    }
    
    // regenerate the childNodes array.
    this._rebuildChildNodes();

    view.set('nextSibling', null);
    view.set('previousSibling', null);
    view.set('parentNode', null) ;
    
    // update parent state.
    view._updateIsVisibleInWindow() ;
    view._flushInternalCaches();
    view._invalidateClippingFrame() ;
    
    view.didRemoveFromParent(this) ;
    this.didRemoveChild(view);
	try{
    return this;
}finally{
	el=null;
}
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
    this.insertBefore(view,oldView) ; this.removeChild(oldView) ;
    return this;
  },

  /**
    Removes the receiver from its parentNode.  If the receiver does not belong
    to a parentNode,  this method does nothing.
    
    @returns {null}
  */
  removeFromParent: function() {
    if (this.parentNode) this.parentNode.removeChild(this) ;    
    return null ;
  },

  /** 
    Works just like removeFromParent but also removes the view from internal
    caches and sets the rootElement to null so that the view and its DOM can
    be garbage collected.
    
    SproutCore includes special gaurds that ensure views and their related 
    DOM elements will be garbage collected whenever your web page unloads.
    However, if you create and destroy views frequently while your application
    is running, you should call this method when views are no longer needed
    to ensure they will be garbage collected even while your application is
    still running.
    
    @returns {null}
  */
  destroy: function() {
    this.removeFromParent() ;
    delete SC.View._view[SC.guidFor(this)];
    return null ;
  },
  
  /**
    Appends the specified view to the end of the receivers childNodes array.  
    This is equivalent to calling insertBefore(view, null);
    
    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver 
  */
  appendChild: function(view) {
    this.insertBefore(view,null) ;   
    return this ; 
  },

  /**
    The array of views that are direct children of the receiver view.  The DOM 
    elements managed by the views are also directl children of the 
    containerElement for the receiver.
    
    @field
    @type Array
  */
  childNodes: [],

  /**
    The first child view in the childNodes array.  If the view does not have 
    any children, this property will be null.
     
    @field
    @type SC.View
  */
  firstChild: null,
  
  /**
    The last child view in the childNodes array.  If the view does not have any children,
    this property will be null.
     
    @field
    @type SC.View
  */
  lastChild: null,
  
  /**
    The next sibling view in the childNodes array of the receivers parentNode.  
    If the receiver is the last view in the array or if the receiver does not 
    belong to a parent view this property will be null.
     
    @field
    @type SC.View
  */
  nextSibling: null,

  /**
    The previous sibling view in the childNodes array of the receivers 
    parentNode.  If the receiver is the first view in the array or if the 
    receiver does not belong to a parent view this property will be null.
     
    @field
    @type SC.View
  */
  previousSibling: null,

  /**
    The parent view this view belongs to.  If the receiver does not belong to a parent view
    then this property is null.
     
    @field
    @type SC.View
  */
  parentNode: null,
  

  /**
    The pane this view belongs to.  The pane is the root of the responder 
    chain that this view belongs to.  Typically a view's pane will be the 
    SC.window object. However, if you have added the view to a dialog, panel, 
    popup or other pane, this property will point to that pane instead.
    
    If the view does not belong to a parentNode or if the view is not 
    onscreen, this property will be null.
    
    @field
    @type SC.View
  */
  pane: function()
  {
    var view = this;
    while(view = view.get('parentNode'))
    {
      if (view.get('isPane') ) break;
    }
    return view;
  }.property(),
  

  /**
    Removes all child views from the receiver.
    
    @returns {void}  
  */
  clear: function() {
    while(this.firstChild) this.removeChild(this.firstChild) ;
  },

  /**
    This method is called on the view just before it is added to a new parent 
    view.  
    
    You can override this method to do any setup you need on your view or to 
    reset any cached values that are impacted by being added to a view.  The 
    default implementation does nothing.
    
    @param parent {SC.View} the new parent
    @paran beforeView {SC.View} the view in the parent's childNodes array that 
      will follow this view once it is added.  If the view is being added to 
      the end of the array, this will be null.
    @returns {void}
  */
  willAddToParent: function(parent, beforeView) {},
  
  /**
    This method is called on the view just after it is added to a new parent 
    view.  
    
    You can override this method to do any setup you need on your view or to 
    reset any cached values that are impacted by being added to a view.  The 
    default implementation does nothing.
    
    @param parent {SC.View} the new parent
    @paran beforeView {SC.View} the view in the parent's childNodes array that 
      will follow this view once it is added.  If the view is being added to 
      the end of the array, this will be null.
    @returns {void}
  */
  didAddToParent: function(parent, beforeView) {},
  
  /**
    This method is called on the view just before it is removed from a parent 
    view.  
    
    You can override this method to clear out any values that depend on the 
    view belonging to the current parentNode.  The default implementation does 
    nothing.
    
    @returns {void}
  */
  willRemoveFromParent: function() {},
  
  /**
    This method is called on the view just after it is removed from a parent 
    view.  
    
    You can override this method to clear out any values that depend on the 
    view belonging to the current parentNode.  The default implementation does 
    nothing.

    @param oldParent {SC.View} the old parent view
    @returns {void}
  */
  didRemoveFromParent: function(oldParent) {},

  /**
    This method is called just before a new child view is added to the 
    receiver's childNodes array.  You can use this to prepare for any layout 
    or other cleanup you might need to do.
    
    The default implementation does nothing.
    
    @param child {SC.View} the view to be added
    @param beforeView {SC.View} and existing child view that will follow the 
      child view in the array once it is added.  If adding to the end of the 
      array, this param will be null.
    @returns {void}
  */
  willAddChild: function(child, beforeView) {},
  
  /**
    This method is called just after a new child view is added to the 
    receiver's childNodes array.  You can use this to prepare for any layout 
    or other cleanup you might need to do.
    
    The default implementation does nothing.
    
    @param child {SC.View} the view that was added
    @param beforeView {SC.View} and existing child view that will follow the 
      child view in the array once it is added.  If adding to the end of the 
      array, this param will be null.
    @returns {void}
  */
  didAddChild: function(child, beforeView) {},
  
  /**
    This method is called just before a child view is removed from the 
    receiver's childNodes array.  You can use this to prepare for any layout 
    or other cleanup you might need to do.
    
    The default implementation does nothing.
    
    @param child {SC.View} the view to be removed
    @returns {void}
  */
  willRemoveChild: function(child) {},
  
  /**
    This method is called just after a child view is removed from the 
    receiver's childNodes array.  You can use this to prepare for any layout 
    or other cleanup you might need to do.
    
    The default implementation does nothing.
    
    @param child {SC.View} the view that was removed
    @returns {void}
  */
  didRemoveChild: function(child) {},
  
  
  nextKeyView: null,
  previousKeyView: null,
  
  nextValidKeyView: function()
  {
    var view = this;
    while (view = view.get('nextKeyView'))
    {
      if (view.get('isVisible') && view.get('acceptsFirstResponder')) {
        return view;
      }
    }
    return null;
  },
  
  previousValidKeyView: function()
  {
    var view = this;
    while (view = view.get('previousKeyView'))
    {
      if (view.get('isVisible') && view.get('acceptsFirstResponder')) {
        return view;
      }
    }
    return null;
  },
  
  /** @private 
    Invoked whenever the child hierarchy changes and any internally cached 
    values might need to be recalculated.       
  */
  _flushInternalCaches: function() {
    // only flush cache for parent if this item was cached since the top level
    // cached can only be populated if this one is populated also...
    if ((this._needsClippingFrame != null) || (this._needsFrameChanges != null)) {
      this._needsClippingFrame = this._needsFrameChanges = null ;
      if (this.parentNode) this.parentNode._flushInternalCaches() ;
    }
  },
  
  // ..........................................
  // SC.Responder implementation 
  //
  
  nextResponder: function()
  {
    return this.parentNode;
  }.property('parentNode'),
  
  // recursively travels down the view hierarchy looking for a view that returns true to  performKeyEquivalent
  performKeyEquivalent: function(keystring, evt)
  {
    var child = this.get('firstChild');
    while (child)
    {
      if (child.performKeyEquivalent(keystring, evt)) return true;
      child = child.get('nextSibling');
    }
    return false;
  },
  
  // ..........................................
  // ELEMENT API
  //

  /**
    An array of currently applied classNames.
    
    @field
    @type {Array}
    @param value {Array} Array of class names to apply to the element
  */
  classNames: function(key, value) { 
    if (value !== undefined) {
        value = Array.from(value) ;
        if (this.rootElement) this.rootElement.className = value.join(' ') ;
        this._classNames = value.slice() ;
    }
    
    if (!this._classNames) {
      var classNames = this.rootElement.className;
      this._classNames = (classNames && classNames.length > 0) ? classNames.split(' ') : [] ;
    }
    return this._classNames ;
  }.property(),

  /**
    Detects the presence of the class name on the root element.
    
    @param className {String} the class name
    @returns {Boolean} YES if class name is currently applied, NO otherwise
  */
  hasClassName: function(className) {
    return (this._classNames || this.get('classNames')).indexOf(className) >= 0 ;
  },

  /**
    Adds the class name to the element.
    
    @param className {String} the class name to add.
    @returns {String} the class name
  */
  addClassName: function(className) {
    if (this.hasClassName(className)) return ; // nothing to do

    var classNames = this._classNames || this.get('classNames') ;
    classNames.push(className) ;
    this.set('classNames', classNames) ;
    return className ;
  },

  /**
    Removes the specified class name from the element.
    
    @param className {String} the class name to remove
    @returns {String} the class name
  */
  removeClassName: function(className) {
    if (!this.hasClassName(className)) return ; // nothing to do
    
    var classNames = this._classNames || this.get('classNames') ;
    classNames = this._classNames = classNames.without(className) ;
    this.set('classNames', classNames) ;
    return className ;
  },

  /**
    Adds or removes the class name according to flag.
    
    This is a simple way to add or remove a class from the root element.
    
    @param className {String} the class name
    @param flag {Boolean} YES to add class name, NO to remove it.
    @returns {String} The class Name.
  */
  setClassName: function(className, flag) {
    return (!!flag) ? this.addClassName(className) : this.removeClassName(className);
  },

  /**
    Toggles the presence of the class name.
    
    If the specified CSS class is applied, it will be removed.  If it is not
    present, it will be added.  Note that if this changes the potential 
    layout of the view, you must wrap calls to this in viewFrameDidChange()
    and viewFrameWillChange().
    
    @param className {String} the class name
    @returns {Boolean} YES if classname is now applied
  */
  toggleClassName: function(className) {
    return this.setClassName(className, !this.hasClassName(className)) ;
  },

  /**
    Retrieves the current value of the named CSS style.
    
    This method is designed to work cross platform and uses the current
    computed style, which is the combination of all applied CSS class names
    and inline styles.
    
    @param style {String} the style key.
    @returns {Object} the style value or null if not-applied/auto
  */
  getStyle: function(style) {
    var element = this.rootElement ;
    if (!this._computedStyle) {
      this._computedStyle = document.defaultView.getComputedStyle(element, null) ;
    }

    //if (style == 'float') style = 'cssFloat' ;
    style = (style === 'float') ? 'cssFloat' : style.camelize() ;
    var value = element.style[style];
    if (!value) {
      value = this._computedStyle ? this._computedStyle[style] : null ;
    }

    if (style === 'opacity') {
      value = value ? parseFloat(value) : 1.0;
    }
    if (value === 'auto') value = null ;
    
    return value ;
  },
  
  
  /**
    Sets the passed hash of CSS styles and values on the element.  You should
    pass your properties pre-camelized.
    
    @param styles {Hash} hash of keys and values
    @param camelized {Boolean} optional bool set to NO if you did not camelize.
    @returns {Boolean} YES if set succeeded.
  */
  setStyle: function(styles, camelized) {
    return Element.setStyle(this.rootElement, styles, camelized) ;
  },

/**
  Updates the HTML of an element.  
  
  This method takes care of nasties like processing scripts and inserting
  HTML into a table.  It is also somewhat slow.  If you control the HTML 
  being inserted and you are not working with table elements, you should use
  the innerHTML property instead.  If you are setting content generated by
  users, this method can insert the content safely.
  
  @param html {String} the html to insert.
*/
  update: function(html) {
    Element.update((this.containerElement || this.rootElement),html) ;
    this.propertyDidChange('innerHTML') ;
  },

  /**
    Retrieves the value for an attribute on the DOM element
    
    @param attrName {String} the attribute name
    @returns {String} attribute value
  */
  getAttribute: function(attrName) {
    return Element.readAttribute(this.rootElement,attrName) ;
  },

  /**
    Sets an attribute on the root DOM element.
    
    @param attrName {String} the attribute name
    @param value {String} the new attribute value
    @returns {String} the set attribute name
  */
  setAttribute: function(attrName, value) {
    this.rootElement.setAttribute(attrName, value) ;
  },
  
  /**
    Returns true if the named attributes is defined on the views root element.
    
    @param attrName {String} the attribute name
    @returns {Boolean} YES if attribute is present.
  */
  hasAttribute: function(attrName) {
    return Element.hasAttribute(this.rootElement, attrName) ;
  },

  // ..........................................
  // STYLE API
  //
  // These properties can be used to directly manipulate various CSS 
  // styles on the view.  These properties are required for animation
  // support.  Values are typically assumed to be in px.
  
  /**
    SC.View's unknown property is used to implement a large class of 
    properties beginning with the the world "style".  You can get or set
    any of these properties to edit individual CSS style properties.
  */
  unknownProperty: function(key, value) {
    if (key && key.match && key.match(/^style/)) {
      key = key.slice(5,key.length).replace(/^./, function(x) { 
        return x.toLowerCase(); 
      });

      var ret = null ;
      
      // handle dimensional properties
      if (key.match(/height$|width$|top$|bottom$|left$|right$/i)) {
        if (value !== undefined) {
          this.viewFrameWillChange() ;
          var props = {} ;
          props[key] = (value) ? value + 'px' : 'auto' ;
          this.setStyle(props) ;
          this.viewFrameDidChange() ;
        }
        ret = this.getStyle(key) ;
        ret = (ret === 'auto') ? null : Math.round(parseFloat(ret)) ;

      // all other properties just pass through (and do not change frame)
      } else {
        if (value !== undefined) {
          var props = {} ;
          props[key] = value ;
          this.setStyle(props) ;
        }
        ret = this.getStyle(key) ;
      }
      return ret;
      
    } else return arguments.callee.base.call(this, key, value) ;
  },
  
  // ..........................................
  // DOM API
  //
  // The methods in this section give you some low-level control over how the
  // view interacts with the DOM.  You do not normally need to work with this.
  
  /**
    This is the DOM element actually managed by this view.  This will be set
    by the view when it is created.  You should rarely need to access this 
    property directly.  When you do access it, you should only do so from 
    within methods you write on your SC.View subclasses, never from outside
    the view.
    
    Unlike most properties, you do not need to use get()/set() to access this
    property.  It is not currently safe to edit this property once the view
    has been createde.
    
    @field
    @type {Element}
  */
  rootElement: null,
  
  /**
    Normally when you add child views to your view, their DOM elements will
    be set as direct children of the root element.  However you can
    choose instead to designate an alertnative child node using this 
    property.  Set this to a selector string to begin with.  The first time
    it is accessed, the view will convert it to an actual element.  It is not
    currently safe to edit this property once the view has been created.
    
    Like rootElement, you should only access this property from within
    methods you write on an SC.View subclass, never from outside the view.
    Unlike most properties, it is not necessary to use get()/set().
    
    @field
    @type {Element}
  */
  containerElement: null,

  // ..........................................
  // VIEW LAYOUT
  //
  // The following methods can be used to implement automatic resizing.
  // The frame and bounds provides a simple way for you to compute the 
  // location and size of your views.  You can then use the automatic
  // resizing.
  
  /**
    Returns true if the view or any of its contained views implement the
    clippingFrameDidChange method.
    
    If this property returns false, then notifications about changes to the 
    clippingFrame will probably not be called on the receiver.  Normally if 
    you do not need to worry about this property since implementing the 
    clippingFrameDidChange() method will change its value and cause your 
    method to be invoked.
    
    This property is automatically updated whenever you add or remove a child 
    view.
  */
  needsClippingFrame: function() {
    if (this._needsClippingFrame == null) {
      var ret = this.clippingFrameDidChange != SC.View.prototype.clippingFrameDidChange;
      var view = this.get('firstChild') ;
      while(!ret && view) {
        ret = view.get('needsClippingFrame') ;
        view = view.get('nextSibling') ;
      }
      this._needsClippingFrame = ret ;
    }
    return this._needsClippingFrame ;
  }.property(),
  
  /**
    Returns true if the view or any of its contained views implements any 
    resize methods.
    
    If this property returns false, changes to your frame view may not be 
    relayed to child methods.  This may mean that your various frame 
    properties could become stale unless you call refreshFrames() first.

    If you want you make sure your frames are up to date, see hasManualLayout.
    
    This property is automatically updated whenever you add or remove a child 
    view.  It returns true if you implement any of the resize methods or if 
    hasManualLayout is true.
  */
  needsFrameChanges: function() {
    if (this._needsFrameChanges == null)   {
      var ret = this.get('needsClippingFrame') || this.get('hasManualLayout') ;
      var view = this.get('firstChild') ;
      while(!ret && view) {
        ret = view.get('needsFrameChanges') ;
        view = view.get('nextSibling') ;
      }
      this._needsFrameChanges = ret ;
    }
    return this._needsFrameChanges ;
  }.property(),
  

  /**
    Returns true if the receiver manages the layout for itself or its 
    children.
    
    Normally this property returns true automatically if you implement
    resizeChildrenWithOldSize() or resizeWithOldParentSize() or 
    clippingFrameDidChange().
    
    If you do not implement these methods but need to make sure your frame is 
    always up-to-date anyway, set this property to true.
  */
  hasManualLayout: function() {
    return (this.resizeChildrenWithOldSize != SC.View.prototype.resizeChildrenWithOldSize) ||
    (this.resizeWithOldParentSize != SC.View.prototype.resizeWithOldParentSize) ||
    (this.clippingFrameDidChange != SC.View.prototype.clippingFrameDidChange) ;
  }.property(),
    
  /**
    Convert a point _from_ the offset parent of the passed view to the current 
    view.

    This is a useful utility for converting points in the coordinate system of
    another view to the coordinate system of the receiver. Pass null for 
    targetView to convert a point from a window offset.  This is the inverse 
    of convertFrameToView().
    
    Note that if your view is not visible on the screen, this may not work.
    
    @param {Point} f The point or frame to convert
    @param {SC.View} targetView The view to convert from.  Pass null to convert from window coordinates.
      
    @returns {Point} The converted point or frame
  */
  convertFrameFromView: function(f, targetView) {
    
    // first, convert to root level offset.
    var thisOffset = SC.viewportOffset(this.get('offsetParent')) ;
    var thatOffset = (targetView) ? SC.viewportOffset(targetView.get('offsetParent')) : SC.ZERO_POINT;
    
    // now get adjustment.
    var adjustX = thatOffset.x - thisOffset.x ;
    var adjustY = thatOffset.y - thisOffset.y ;
    return { x: (f.x + adjustX), y: (f.y + adjustY), width: f.width, height: f.height  };
  },
  
  /**
    Convert a point _to_ the offset parent of the passed view from the current 
    view.

    This is a useful utility for converting points in the coordinate system of
    the receiver to the coordinate system of another view. Pass null for 
    targetView to convert a point to a window offset.  This is the inverse of 
    convertFrameFromView().
    
    Note that if your view is not visible on the screen, this may not work.
    
    @param {Point} f The point or frame to convert
    @param {SC.View} targetView The view to convert to.  Pass null to convert to window coordinates.
      
    @returns {Point} The converted point or frame
  */
  convertFrameToView: function(f, sourceView) {
    // first, convert to root level offset.
    var thisOffset = SC.viewportOffset(this.get('offsetParent')) ;
    var thatOffset = (sourceView) ? SC.viewportOffset(sourceView.get('offsetParent')) : SC.ZERO_POINT ;
    
    // now get adjustment.
    var adjustX = thisOffset.x - thatOffset.x ;
    var adjustY = thisOffset.y - thatOffset.y ;
    return { x: (f.x + adjustX), y: (f.y + adjustY), width: f.width, height: f.height };
  },

  /**
    This property returns a DOM ELEMENT that is the offset parent for
    this view's frame coordinates.  Depending on your CSS, this parent
    may or may not match with the parent view.
    
    @example
    offsetView = $view(this.get('offsetParent')) ;
    
    @field
    @type {Element}
  */
  offsetParent: function() {
    
    // handle simple cases.
    var el = this.rootElement ;
    if (!el || el === document.body) return el;
    if (el.offsetParent) return el.offsetParent ;

    // in some cases, we can't find the offset parent so we walk up the 
    // chain until an element is found with a position other than
    // 'static'
    //
    // Note that IE places DOM elements not in the main body inside of a 
    // document-fragment root.  We need to treat document-fragments (i.e. 
    // nodeType === 11) as null values
    var ret = null ;
    while(!ret && (el = el.parentNode) && (el.nodeType !== 11) && (el !== document.body)) {
      if (Element.getStyle(el, 'position') !== 'static') ret = el;
    }
    if (!ret && (el === document.body)) ret = el ;
    return ret ;
  }.property(),

  /**
    The inner bounds for the content shown inside of this frame.  Reflects 
    scroll position and other properties.

    The inner frame returns the actual available frame for child elements, 
    less any borders or scroll bars. 
    
    This value can change when:
    - the receiver's frame changes
    - the receiver's child views change, adding or removing scrollbars
    - You can the CSS or applied style that effects the borders or scrollbar visibility
  */
  innerFrame: function(key, value) {
    
    var f ;
    if (this._innerFrame == null) {  

      // get the base frame
      // The _collectInnerFrame function is set at the bottom of this file
      // based on the browser type.
      var el = this.rootElement ;
      f = this._collectFrame(SC.View._collectInnerFrame) ;

      // bizarely for FireFox if your offsetParent has a border, then it can 
      // impact the offset
      if (SC.Platform.Firefox) {
        var parent = el.offsetParent ;
        var overflow = (parent) ? Element.getStyle(parent, 'overflow') : 'visible' ;
        if (overflow && overflow !== 'visible') {
          var left = parseInt(Element.getStyle(parent, 'borderLeftWidth'),0) || 0 ;
          var top = parseInt(Element.getStyle(parent, 'borderTopWidth'),0) || 0 ;
          f.x += left; f.y += top ;
        }
      }
      
      // fix the x & y with the clientTop/clientLeft
      var clientLeft, clientTop ;
      if (el.clientLeft == null) {
        clientLeft = parseInt(this.getStyle('border-left-width'),0) || 0 ;
      } else clientLeft = el.clientLeft ;

      if (el.clientTop == null) {
        clientTop = parseInt(this.getStyle('border-top-width'),0) || 0 ;
      } else clientTop = el.clientTop ;

      f.x += clientLeft; f.y += clientTop;
      
      // cache this frame if using manual layout mode
      this._innerFrame = SC.cloneRect(f);
    } else f = SC.cloneRect(this._innerFrame) ;
    return f ;
  }.property('frame'),

  /** 
    The outside bounds of your view, offset top/left from its offsetParent

    The frame rect is the area actually occupied by a view including any
    borders or padding, but excluding margins.  
    
    The frame is calculated and cached the first time you get it.  Afer that, 
    the frame cache should automatically update when you make changes that 
    will effect the view frames unless you change the frame indirectly, such 
    as through changing CSS classes or by-passing the view to edit the DOM.

    If you make a change like this, be sure to wrap the code that makes this
    change with calls to viewFrameWillChange() and viewFrameDidChange() on the
    highest-level view that will be impacted by the change.  Calling this
    method will automatically update child frames as well.
    
    When you set the frame property, it will update the left, top, height,
    and width CSS attributes on the element.  Since the height and width in
    the frame rect includes borders and padding, the view will automatically
    adjust the height and width CSS it sets to account for this.  

    If you would prefer to edit the CSS attributes for the frame directly
    instead, you can do so by using the styleTop, styleLeft, styleRight, 
    styleBottom, styleWidth, and styleHeight properties on the view.  These
    properties will update the CSS attributes and call viewFrameDidChange()/
    viewFrameWillChange().

    @field
  */
  frame: function(key, value) {

    // if value was passed, set the values in the style
    // now update the frame if needed.  Only actually change the style for
    // those parts of the frame that were passed in.
    if (value !== undefined) {
      
      this.viewFrameWillChange() ;
      
      var f= value ;
      var style = {} ;
      var didResize = false ;

      // collect required info 
      // reposition X
      if (value.x !== undefined) {
        style.left = Math.floor(f.x) + 'px' ;
        style.right = 'auto';
      }

      // reposition Y
      if (value.y !== undefined) {
        style.top = Math.floor(f.y) + 'px' ;
        style.bottom = 'auto';
      }
      
      // Resize width
      if (value.width !== undefined) {
        didResize = true ;
        var padding = 0 ;
        var idx = SC.View.WIDTH_PADDING_STYLES.length;
        while(--idx >= 0) {
          padding += parseInt(this.getStyle(SC.View.WIDTH_PADDING_STYLES[idx]), 0) || 0;
        }
        style.width = (Math.floor(f.width) - padding).toString() + 'px' ;
      }
      
      // Resize Height
      if (value.height !== undefined) {
        didResize = true ;
        var padding = 0 ;
        var idx = SC.View.HEIGHT_PADDING_STYLES.length;
        while(--idx >= 0) {
          padding += parseInt(this.getStyle(SC.View.HEIGHT_PADDING_STYLES[idx]), 0) || 0;
        }
        style.height = (Math.floor(f.height) - padding).toString() + 'px' ;
      }

      // now apply style change and clear the cached frame
      this.setStyle(style) ;
      
      // notify for a resize only.
      this.viewFrameDidChange() ;
    }
    
    // build frame.  We can use a cached version but only 
    // if layoutMode == SC.MANUAL_MODE
    var f;
    if (this._frame == null) {
      var el = this.rootElement ;
      f = this._collectFrame(function() {
        return { 
          x: el.offsetLeft, 
          y: el.offsetTop, 
          width: el.offsetWidth, 
          height: el.offsetHeight 
        };
      }) ;
      
      // bizarely for FireFox if your offsetParent has a border, then it can 
      // impact the offset
      if (SC.Platform.Firefox) {
        var parent = el.offsetParent ;
        var overflow = (parent) ? Element.getStyle(parent, 'overflow') : 'visible' ;
        if (overflow && overflow !== 'visible') {
          var left = parseInt(Element.getStyle(parent, 'borderLeftWidth'),0) || 0 ;
          var top = parseInt(Element.getStyle(parent, 'borderTopWidth'),0) || 0 ;
          f.x += left; f.y += top ;
        }
      }
      
      // cache this frame if using manual layout mode
      this._frame = SC.cloneRect(f);
    } else f = SC.cloneRect(this._frame) ;

    // finally return the frame. 
    return f ;
  }.property(),
  
  /**
    The current frame size.
    
    This property will actually return the same value as the frame property, 
    however setting this property will set only the frame size and ignore any 
    origin you might pass.
    
    @field
  */
  size: function(key, value) {
    if (value !== undefined) {
      this.set('frame',{ width: value.width, height: value.height }) ;
    }
    return this.get('frame') ;
  }.property('frame'),
  
  /**
    The current frame origin.
    
    This property will actually return the same value as the frame property, 
    however setting this property will set only the frame origin and ignore 
    any size you might pass.
    
    @field
  */
  origin: function(key, value) {
    if (value !== undefined) {
      this.set('frame',{ x: value.x, y: value.y }) ;
    }
    return this.get('frame') ;
  }.property('frame'),
  
  /**
    Call this method before you make a change that will impact the frame of 
    the view such as changing the border thickness or adding/removing a CSS 
    style.
    
    Once you finish making your changes, be sure to call viewFrameDidChange() 
    as well. This will deliver any relevant resizing and other notifications.  
    It is safe to nest multiple calls to this method.
    
    This method is called automatically anytime you set the frame.
    
    @returns {void}
  */
  viewFrameWillChange: function() {
    if (this._frameChangeLevel++ <= 0) {
      this._frameChangeLevel = 1 ;

      // save frame information if view has manual layout.
      if (this.get('needsFrameChanges')) {
        this._cachedFrames = this.getEach('innerFrame', 'clippingFrame', 'frame') ;
      } else this._cachedFrames = null ;
      this.beginPropertyChanges(); // suspend change notifications
    }
  },

  /**
    Call this method just after you finish making changes that will impace the 
    frame of the view such as changing the border thickness or adding/removing 
    a CSS style.
    
    It is safe to next multiple calls to this method.   This method is called 
    automatically anytime you set the frame.
    
    @returns {void}
  */
  viewFrameDidChange: function(force) {
    
    // clear the frame caches
    this.recacheFrames() ;

    // if this is a top-level call then also deliver notifications as needed.
    if (--this._frameChangeLevel <= 0) {
      this._frameChangeLevel = 0 ;
      if (this._cachedFrames) {
        var newFrames = this.getEach('innerFrame', 'clippingFrame') ;
        
        // notify if clippingFrame has changed and clippingFrameDidChange is 
        // implemented.
        var nf = newFrames[1]; var of = this._cachedFrames[1] ;
        if (force || (nf.width != of.width) || (nf.height != of.height)) {
          this._invalidateClippingFrame() ;
        }

        // notify children if the size of the innerFrame has changed.
        var nf = newFrames[0]; var of = this._cachedFrames[0] ;
        if (force || (nf.width != of.width) || (nf.height != of.height)) {
          this.resizeChildrenWithOldSize(this._cachedFrames.last()) ;          
        }
        
        // clear parent scrollFrame if needed
        var parent = this.parentNode ;
        while (parent && parent != SC.window) {
          if (parent._scrollFrame) parent._scrollFrame = null ;
          parent = parent.parentNode ;
        }
        
        this.notifyPropertyChange('frame') ; // trigger notifications.
      }
      
      // allow notifications again
      this.endPropertyChanges() ;
    }
  },


  /**
    Clears any cached frames so the next get will recompute them.
    
    This method does not notify any observers of changes to the frames.  It 
    should only be used when you need to make sure your frame info is up to 
    date but you do not expect anything to have happened that frame observers 
    would be interested in.
  */
  recacheFrames: function() {
    this._innerFrame = this._frame = this._clippingFrame = this._scrollFrame = null ; 
  },
  
  /**
    Set to true if you expect this view to have scrollable content.

    Normally views do not monitor their onscroll event.  If you set this 
    property to true, however, the view will observe its onscroll event and 
    update its scrollFrame and clippedFrame.

    This will also register the view as a scrollable area that can be 
    auto-scrolled during a drag/drop event.
  */
  isScrollable: false,
  
  /**
    The frame used to control scrolling of content.
    
    x,y => offset from the innerFrame root.
    width,height => total size of the frame
    
    If the frame does not have scrollable content, then the size will be equal 
    to the innerFrame size.

    This frame changes when:
    - the receiver's innerFrame changes
    - the scroll location is changed programatically
    - the size of child views changes
    - the user scrolls the view
    
    @field
  */
  scrollFrame: function(key, value) {  

    // if value was passed, update the scroll x,y only.
    if (value != undefined) {
      var el = this.rootElement ;
      if (value.x != null) el.scrollLeft = 0-value.x ;
      if (value.y != null) el.scrollTop = 0-value.y ;
      this._scrollFrame = null ;
      this._invalidateClippingFrame() ;
    }
    
    // build frame.  We can use a cached version but only 
    var f;
    if (this._scrollFrame == null) {
      var el = this.rootElement ;
      f = this._collectFrame(function() {
        return { 
          x: 0 - el.scrollLeft, 
          y: 0 - el.scrollTop, 
          width: el.scrollWidth, 
          height: el.scrollHeight 
        };
      }) ;
      
      // cache this frame if using manual layout mode
      this._scrollFrame = SC.cloneRect(f);
    } else f = SC.cloneRect(this._scrollFrame) ;

    // finally return the frame. 
    return f ;
  }.property('frame'),
  
  /**
    The visible portion of the view.

    Returns the subset of the receivers frame that is actually visible on
    screen. This frame is automatically updated whenever one of the following 
    changes:
    
    - A parent view is resized
    - A parent view's scrollFrame changes.
    - The receiver is moved or resized
    - The receiver or a parent view is added to or removed from the window.
    
    @field
  */
  clippingFrame: function() {
    var f ;
    if (this._clippingFrame == null) {

      //if (this instanceof SC.SplitView) debugger ;
      
      // my clipping frame is usually my frame
      f = this.get('frame') ;
      
      // scope to my parents clipping frame.
      if (this.parentNode) {
        
        // use only the visible portion of the parent's innerFrame.
        var parent = this.parentNode ;
        var prect = SC.intersectRects(parent.get('clippingFrame'), parent.get('innerFrame'));

        // convert the local view's coordinates
        prect = this.convertFrameFromView(prect, parent) ;

        // if parent is scrollable, then adjust by scroll frame also.
        if (this.parentNode.get('isScrollable')) {
          var scrollFrame = this.get('scrollFrame') ;
          prect.x -= scrollFrame.x ; 
          prect.y -= scrollFrame.y ;
        }

        // blend with current frame
        f = SC.intersectRects(f, prect) ;
      } else {
        f.width = f.height = 0 ;
      }
      
      this._clippingFrame = SC.cloneRect(f) ;

    } else f = SC.cloneRect(this._clippingFrame) ;
    return f ;
  }.property('frame', 'scrollFrame'),
  
  /**
    Called whenever the receivers clippingFrame has changed.  You can override 
    this method to perform partial rendering or other clippingFrame-dependent 
    actions.
    
    The default implementation does nothing (and may not even be called do to 
    optimizations).  Note that this is the preferred way to respond to changes 
    in the clippingFrame of using an observer since this method is gauranteed 
    to happen in the correct order.  You can use observers and bindings as 
    well if you wish to handle anything that need not be handled 
    synchronously.
  */
  clippingFrameDidChange: function() {
    
  },
  
  /**
    Called whenever the view's innerFrame size changes.  You can override this 
    method to perform your own layout of your child views.  
    
    If you do not override this method, the view will assume you are using 
    CSS to layout your child views.  As an optimization the view may not 
    always call this method if it determines that you have not overridden it.
    
    This default version simply calls resizeWithOldParentSize() on all of its
    children.
    
    @param oldSize {Size} The old frame size of the view.
    @returns {void}
  */
  resizeChildrenWithOldSize: function(oldSize) {
    var child = this.get('firstChild') ;
    while(child) {
      child.resizeWithOldParentSize(oldSize) ;
      child = child.get('nextSibling') ;
    }
  },

  /**
    Called whenever the parent's innerFrame size has changed.  You can 
    override this method to change how your view responds to this change.
    
    If you do not override this method, the view will assume you are using CSS 
    to control your layout and it will simply relay the change information to 
    your child views.  As an optmization, the view may not always call this 
    method if it determines that you have not overridden it.
    
    @param oldSize {Size} The old frame size of the parent view.
  */
  resizeWithOldParentSize: function(oldSize) {
    this.viewFrameWillChange() ;
    this.viewFrameDidChange(YES) ;
  },
  
  /** @private
    Handler for the onscroll event.  Hooked in on init if isScrollable is 
    true.  Notify children that their clipping frame has changed.
  */
  _onscroll: function() {
    this._scrollFrame = null ;
    this.notifyPropertyChange('scrollFrame') ;
    SC.Benchmark.start('%@.onscroll'.fmt(this)) ;
    this._invalidateClippingFrame() ;
    SC.Benchmark.end('%@.onscroll'.fmt(this)) ;
  },

  _frameChangeLevel: 0,
  
  /** @private
    Used internally to collect client offset and location info.  If the 
    element is not in the main window or hidden, it will be added temporarily 
    and then the passed function will be called.
  */
  _collectFrame: function(func) {
    var el = this.rootElement ;
    
    // if not visible in window, move parent node into window and get 
    // dim and offset.  If the element has no parentNode, then just move
    // the element in.
    var isVisibleInWindow = this.get('isVisibleInWindow') ;
    if (!isVisibleInWindow) {
      var pn = el.parentNode || el ;
      if (pn === SC.window.rootElement) pn = el ;
      
      var pnParent = pn.parentNode ; // cache former parent node
      var pnSib = pn.nextSibling ; // cache next sibling
      SC.window.rootElement.insertBefore(pn, null) ;
    }

    // if view is not displayed, temporarily display it also
    var display = this.getStyle('display') ;
    var isHidden = !(display != 'none' && display != null) ;

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    if (isHidden) {
      var els = this.rootElement.style;
      var originalVisibility = els.visibility;
      var originalPosition = els.position;
      var originalDisplay = els.display;
      els.visibility = 'hidden';
      els.position = 'absolute';
      els.display = 'block';
    }

    var ret = func.call(this) ;
    
    if (isHidden) {
      els.display = originalDisplay;
      els.position = originalPosition;
      els.visibility = originalVisibility;
    }

    if (!isVisibleInWindow) {
      if (pnParent) {
        pnParent.insertBefore(pn, pnSib) ;
      } else {
        if(pn.parentNode)
          SC.window.rootElement.removeChild(pn) ;
      }
    }  
    
    return ret;
  },
  
  /** @private
    Called whenever some aspect of the receiver's frames have changed that 
    probably has invalidated the child views clippingFrames.  Events that cause 
    this include:
    
    - change to the innerFrame size
    - change to the scrollFrame
    - change to the clippingFrame
    
    For performance reasons, this only passes onto children if they or a decendent 
    implements the clippingFrameDidChange method.
  */
  _invalidateChildrenClippingFrames: function() {
    var view = this.get('firstChild') ;
    while(view) {
      view._invalidateClippingFrame() ;
      view = view.get('nextSibling') ;
    }
  },

  /** @private
    Called by a parentNode whenever the clippingFrame needs to be recalculated.
  */
  _invalidateClippingFrame: function() {  
    if (this.get('needsClippingFrame')) {
      this._clippingFrame = null ;
      this.clippingFrameDidChange() ; 
      this.notifyPropertyChange('clippingFrame') ;
      this._invalidateChildrenClippingFrames() ;
    }
  },
  
  // ..........................................
  // PROPERTIES
  //

  /** 
    Used to show or hide the view. 
    
    If this property is set to NO, then the DOM element will be hidden using
    display:none.  You will often want to bind this property to some setting 
    in your application to make various parts of your app visible as needed.

    If you have animation enabled, then changing this property will actually
    trigger the animation to bring the view in or out.
    
    The default binding format is SC.Binding.Bool
    
    @field
    @type {Boolean}
  */
  isVisible: true,
  
  /** @private */
  isVisibleBindingDefault: SC.Binding.Bool,
  
  /**
    (Read Only) The current display visibility of the view.
    
    Usually, this property will mirror the current state of the isVisible
    property.  However, if your view animates its visibility in and out, then
    this will not become false until the animation completes.
    
    @type {Boolean}
  */
  displayIsVisible: true,

  /**
    true when the view is actually visible in the DOM window.

    This property is set to true only when the view is (a) in the main DOM
    hierarchy and (b) all parent nodes are visible and (c) the receiver node
    is visible.
    
    @type {Boolean}
    @field
  */
  isVisibleInWindow: NO,
  
  /**
    If true, the tooltip will be localized.  Also used by some subclasses.
    
    @type {Boolean}
    @field
  */
  localize: false,

  /**
    Applied to the title attribute of the rootElement DOM if set. 
    
    If localize is true, then the toolTip will be localized first.
    
    @type {String}
    @field
  */
  toolTip: '',


  /**
    The HTML you want to use when creating a new element. 
    
    You can specify the HTML as a string of text, using the NodeDescriptor, or
    by pointing directly to an element.
    
    Note that as an optimization, SC.View will actually convert the value of 
    this property to an actual DOM structure the first time you create a view 
    and then clone the DOM structure for future views.  
    
    This means that in general you should only set the value of emptyElement 
    when you create a view subclass.  Changing this property value at other 
    times will often have no effect.
    
    @field
    @type {String}
  */
  emptyElement: "<div></div>",
  
  /**
    If true, view will display in a lightbox when you show it.
    
    @field
    @type {Boolean}
  */
  isPanel: false,

  /**
    If true, the view should be modal when shown as a panel.
  
    @field
    @type {Boolean}
  */
  isModal: true,
  
  /**
    Enable visible animation by default.
  */
  isAnimationEnabled: true,
  
  /**
    General support for animation.  Just call this method and it will build
    and play an animation starting from the current state.  The second param
    is optional.  It should either be a hash of animator options or an 
    animator object returned by a previous call to transitionTo().
  
  */
  transitionTo: function(target,animator,opts) {
    var animatorOptions = opts || {} ;

    // Create or reset the animator.
    if (animator && !animator._isAnimator) {
      var finalStyle = animator ;
      if (!this.get("isAnimationEnabled"))  {
        animatorOptions = Object.clone(animatorOptions) ;
        animatorOptions.duration = 1; 
      }
      if (animatorOptions.duration) {
        animatorOptions.duration = parseInt(animatorOptions.duration,0) ;
      }

      animator = Animator.apply(this.rootElement, finalStyle, animatorOptions);
      animator._isAnimator = true ;
    }

    // trigger animation
    if (animator) {
      animator.jumpTo(animator.state) ;
      animator.seekTo(target) ;
    }
    return animator ;    
  },

  /**
    The contents of the view as HTML. You can use this property to both 
    retrieve the content and to change it.  Use this property instead of 
    manually changing the content of your view as this property works around
    certain cross-browser bugs.
    
    @field
  */
  innerHTML: function(key, value) {
    if (value !== undefined) {
      
      // Clear the text node.
      this._textNode = null ;
      
      // Safari2 has a bad habit of sometimes not actually changing its 
      // innerHTML. This will make sure the innerHTML get's changed properly.
      if (SC.isSafari() && !SC.isSafari3()) {
        var el = (this.containerElement || this.rootElement) ; var reps = 0 ;
        var f = function() {
          el.innerHTML = '' ; el.innerHTML = value ;
          if ((reps++ < 5) && (value.length>0) && (el.innerHTML == '')) {
            f.invokeLater() ;
          }
        };
        f();
      } else (this.containerElement || this.rootElement).innerHTML = value;
    } else value = (this.containerElement || this.rootElement).innerHTML ;
    return value ;
  }.property(),

  /**
    The contents of the view as plain text.  You can use this property to
    both retrieve the content and to change it.  Use this property instead of
    the innerHTML property when you want to set plain text only as this 
    property is much faster.
  
    @field
  */
  innerText: function(key, value) {
    if (value !== undefined) {
      if (value == null) value = '' ;

      // add a textNode if necessary
      if (this._textNode == null) {
        this._textNode = document.createTextNode(value) ;
        var el = this.rootElement || this.containerElement ;
        while(el.firstChild) el.removeChild(el.firstChild) ;
        el.appendChild(this._textNode) ;
      } else this._textNode.data = value ;
    }
    
    return (this._textNode) ? this._textNode.data : this.innerHTML().unescapeHTML() ;
    
  }.property(),
  

  // ..........................................
  // SUPPORT METHODS
  //
  init: function() {
    arguments.callee.base.call(this) ;

    // configure them outlets.
    if (SC.BENCHMARK_CONFIGURE_OUTLETS) SC.Benchmark.start('SC.View.configureOutlets') ;
    this.configureOutlets() ;
    if (SC.BENCHMARK_CONFIGURE_OUTLETS) SC.Benchmark.end('SC.View.configureOutlets') ;

    var toolTip = this.get('toolTip') ;
    if(toolTip && (toolTip != '')) this._updateToolTipObserver();

    // if container element is a string, convert it to an actual DOM element.
    if (this.containerElement && ($type(this.containerElement) === T_STRING)) {
      this.containerElement = this.$sel(this.containerElement);
    }

    // register as a drop target and scrollable.
    if (this.get('isDropTarget')) SC.Drag.addDropTarget(this) ;
    if (this.get('isScrollable')) SC.Drag.addScrollableView(this) ;
    
    // add scrollable handler
    if (this.isScrollable) this.rootElement.onscroll = SC.View._onscroll ;
    
    // setup isVisibleInWindow ;
    this.isVisibleInWindow = (this.parentNode) ? this.parentNode.get('isVisibleInWindow') : NO;
  },
  
  // this method looks through your outlets array and will try to
  // reconfigure any missing ones.
  configureOutlets: function() {
    
    if (!this.outlets || (this.outlets.length <= 0)) return ; 

    // lookup outlets as selector paths or execute the function if there 
    // is one.
    this.beginPropertyChanges(); // bundle changes
    for(var oloc=0;oloc < this.outlets.length;oloc++) {
      var view = this.outlet(this.outlets[oloc]) ;
    }    
    this.endPropertyChanges() ;
  },

  // ..........................................
  // VISIBILITY METHODS
  //
  
  // Calling this method will show the view.  Don't call this method
  // directly but instead set the isVisible property to true.  You can
  // override this method to provide your own show capabilities.
  show: function() {
    Element.show(this.rootElement) ;
    this.removeClassName('hidden') ;
    this.set('displayIsVisible',true) ;
  },

  // This is the primitive method for hiding a view.  It will be called when
  // isVisible is set to false after an animation runs or immediate if no
  // animation is defined.
  hide: function() {
    Element.hide(this.rootElement) ;
    this.addClassName('hidden') ;
    this.set('displayIsVisible', false) ;
  },

  // ..........................................
  // DEPRECATED. DO NOT USE
  //

  // deprecated.  Included only for compatibility.
  animateVisible: function(key, value) {
    if (value !== undefined) return this.set('isAnimationEnabled',value) ;
    return this.get('isAnimationEnabled');
  }.property('isAnimationEnabled'),


  // ..........................................
  // PRIVATE METHODS
  //

  // this will set the rootElement, cleaning up any old element.
  _attachRootElement: function(el) {
    if (this.rootElement) this.rootElement._configured = null ;
    this.rootElement = el ; 
    el._configured = this._guid ;
  },
  
  // This method is called internally after you add or remove a child view.
  // It will rebuild the childNodes array to reflect all children.
  _rebuildChildNodes: function() {
    var ret = [] ; var view = this.firstChild;
    while(view) { ret.push(view); view = view.nextSibling; }
    this.set('childNodes', ret) ;
  },
  
  _toolTipObserver: function() {
    var toolTip = this.get('toolTip') ;
    if (this.get('localize')) toolTip = toolTip.loc() ;
    this.rootElement.title = toolTip ;
  }.observes("toolTip"),
  
  _isVisibleObserver: function() {
    var flag = this.get('isVisible') ;
    if ((this._isVisible === undefined) || (flag != this._isVisible)) {
      this._isVisible = flag ;
      if (flag) {
        this._show() ;
      } else this._hide() ; 

      // update parent state.
      this._updateIsVisibleInWindow() ;
    }
  }.observes('isVisible'),
  
  _updateIsVisibleInWindow: function(parentNodeState) {
    if (parentNodeState === undefined) {
      var parentNode = this.get('parentNode') ;
      parentNodeState = (parentNode) ? parentNode.get('isVisibleInWindow') : false ;
    }
    
    var visible = parentNodeState && this.get('isVisible') ;

    // if state changes, update and notify children.
    if (visible != this.get('isVisibleInWindow')) {
      this.set('isVisibleInWindow', visible) ;
      this.recacheFrames() ;
      var child = this.get('firstChild') ;
      while(child) {
        child._updateIsVisibleInWindow(visible) ;
        child = child.get('nextSibling') ;
      }
    }
  },
  
  // Calling this method will show the view.  Don't call this method
  // directly but instead set the isVisible property to true.  You can
  // override this method to provide your own show capabilities.
  _show: function(anchorView, triggerEvent) {
    // compatibility
    if (this.showView) return this.showView() ;

    // if this is a type of pane, call the pane manager.
    var paneType = this.get('paneType') ;
    if (this.get('isPanel')) paneType = SC.PANEL_PANE; // compatibility
    if (paneType) {
      if (anchorView === undefined) anchorView = null ;
      if (triggerEvent === undefined) triggerEvent = null ;
      SC.PaneManager.manager().showPaneView(this, paneType, anchorView, triggerEvent) ;
      this.set('displayIsVisible', true) ;
      
    // if an animation is defined and animations are configured, use that.
    // the displayIsVisible property will be set to true when the animation
    // completes.
    } else if (this.visibleAnimation && this.get('isAnimationEnabled')) {
      this._transitionVisibleTo(1.0) ;

      // at this point the animation has been reset to the beginng.  Run the 
      // core show() method immediately so the animation will be visible.
      this.show() ; 
      
    // otherwise, just change over visible settings.
    } else {
      this._visibleAnimator = null ;
      this.show() ;
    }

    return this ;
  },

  _hide: function() {
    // compatibility
    if (this.hideView) return this.hideView() ;

    // if this is a type of pane, call the pane manager.
    var isPane = (!!this.get('paneType')) || this.get('isPanel') ;
    if (isPane) {
      SC.PaneManager.manager().hidePaneView(this) ;
      this.set('displayIsVisible', false) ;
      
    // if an animation is defined and animations are configured, use that.
    // the displayIsVisible property will be set to false when the animation
    // completes.
    } else if (this.visibleAnimation && this.get('isAnimationEnabled')) {
      this._transitionVisibleTo(0.0) ;
      
    // otherwise, just change over visible settings.
    } else {
      this._visibleAnimator = null;
      this.hide();
    }
     
    return this ;
  },
  
  
  _transitionVisibleTo: function(target) {
    var a ;

    // if an animator already exists, just transition to the new state.
    if (this._visibleAnimator) {
      this.transitionTo(target,this._visibleAnimator); 
      
    // otherwise, build the animator from the options passed.  Patch in our
    // own onComplete handler.
    } else {
      var opts = this.visibleAnimation ;
      var style = [opts.hidden,opts.visible] ;
      opts.onComplete = 
        this._animateVisibleDidComplete.bind(this,opts.onComplete) ;
      this._visibleAnimator = this.transitionTo(target,style,opts);      
    }
  },

  // This is called when the animation completes.  Finish cleaning up the
  // visibility section.
  _animateVisibleDidComplete: function(chainFunc) {
    if (!this.get('isVisible')) this.hide() ;
    if (chainFunc) chainFunc(this) ;
  },
  
  _firstResponderObserver: function(target, key, value) {
    this.setClassName('focus',value) ;
  }.observes('isFirstResponder'),
  
  _dropTargetObserver: function() {
    if (this.get('isDropTarget')) {
      SC.Drag.addDropTarget(this) ;
    } else SC.Drag.removeDropTarget(this) ;
  }.observes('isDropTarget'),
  
  // .............................................
  // SPECIAL TYPES OF VIEWS
  //

  // This will show the pane as a popup or picker (depending on the paneType
  // you have set.)  This works just like setting isVisible to true, except
  // that it also passes the anchorView and triggerEvent you pass in.
  popup: function(anchorView, triggerEvent) {
    
    // this will bypass the normal observer machinery, calling the private
    // _show method ourselves.  To avoid triggering _show twice, we patch up
    // the internal _isVisible property.
    this._isVisible = true ;
    this._show(anchorView, triggerEvent) ;
    this.set('isVisible', true);
  },
  
  // This can be used to manually add observers to the rootElement for the 
  // methods in the passed map.  You generally don't want to do this since we 
  // handle event propgation through the responder chain.
  configureObserverMethods: function(methodMap) {
    for(var name in methodMap) {
      if (!methodMap.hasOwnProperty(name)) continue ;
      if (this[name]) {
        var method = this[name].bindAsEventListener(this);
        Event.observe(this.rootElement,methodMap[name],method) ;
      }
    }
  }//,
  
  // toString: function() {
  //   var el = this.rootElement ;
  //   var tagName = (!!el.tagName) ? el.tagName.toLowerCase() : 'document' ;
  // 
  //   var className = el.className ;
  //   className = (className && className.length>0) ? 'class=%@'.fmt(className) : null;
  // 
  //   var idName = el.id ;
  //   idName = (idName && idName.length>0) ? 'id=%@'.fmt(idName) : null;
  // 
  //   return "%@:%@<%@>".fmt(this._type, this._guid, [tagName,idName, className].compact().join(' ')) ;
  // }
    
}) ;
  
// Class Methods
SC.View.mixin({  

  // this is the global registry of views.  It's used to map elements back
  // to the views that own them.
  _view: {},
  
  findViewForElement: function(el) {
    var guid = el._configured ;
    return (guid) ? SC.View._view[guid] : null ;  
  },
  
  // ..........................................
  // SETUP
  //
  // This works much like create except that it works on the passed in
  // element instead of trying to find something new.  If you pass null for 
  // the first parameter,  then a new element will be created with the html
  // you set in content.
  viewFor: function(el,config) {
    if (el) el = $(el) ;

    var r = SC.idt.active ; var vStart ;
    if (r) SC.idt.v_count++;

    if (r) vStart = new Date().getTime() ;
    
    // find or build the element.
    if (!el) {    
      var emptyElement = this.prototype._cachedEmptyElement || this.prototype.emptyElement; 
      
      // if the emptyElement is a string not starting with '<', treat it like 
      // an id and find it in the doc.  If an element is found, cache it for
      // future use.
      var isString = typeof(emptyElement) == 'string' ; 
      if (isString && (emptyElement.slice(0,1) != '<')) {
        var el = $sel(emptyElement) ;
        if (el) {
          this.prototype.emptyElement = emptyElement = el ;
          isString = false ;
        }
      }

      // if still a string, then use it to create HTML.  Save the generated 
      // element so that we can avoid doing this over again.
      if (isString) {
        SC._ViewCreator.innerHTML = emptyElement ;
        el = $(SC._ViewCreator.firstChild) ;
        SC.NodeCache.appendChild(el) ;
        this.prototype._cachedEmptyElement = el.cloneNode(true) ;
        
      } else if (typeof(emptyElement) == "object") {
        if (emptyElement.tagName) {
          el = emptyElement.cloneNode(true) ;
        } else el = SC.NodeDescriptor.create(emptyElement) ;
      }
    }
    if (r) SC.idt.vc_t += (new Date().getTime()) - vStart ;

    // configure only once.
    if (el && el._configured) return SC.View.findViewForElement(el); 
    
    // Now that we have found an element, instantiate the view.
    var args = SC.$A(arguments) ; args[0] = { rootElement: el } ;
    if (r) vStart = new Date().getTime();
    var ret = new this(args,this) ; // create instance.
    if (r) SC.idt.v_t += (new Date().getTime()) - vStart;
    el._configured = ret._guid ;

    // return the view.
    SC.View._view[ret._guid] = ret ;
    return ret ;    
  },
  
  // create in the view work is like viewFor but with 'null' for el
  create: function(configs) {
    var args = SC.$A(arguments) ;
    args.unshift(null) ;
    return this.viewFor.apply(this,args) ;  
  },
  
  // extend works just like a normal extend except that we need to delete the cached empty
  // element.
  extend: function(configs) {
    var ret = SC.Object.extend.apply(this, arguments) ;  
    ret.prototype._cachedEmptyElement = null ;
    return ret ;
  },

  /** 
    Defines a view as an outlet.  This will return an function that
    can be executed at a later time to actually create itself as an outlet.
  */
  outletFor: function(path) {
    var viewClass = this ; // save the view class
    var func = function() {
      if (SC.BENCHMARK_OUTLETS) SC.Benchmark.start("OUTLET(%@)".format(path)) ;

      // if no path was passed, then create the view from scratch
      if (path == null) {
        var ret = viewClass.viewFor(null) ;
        
      // otherwise, try to find the HTML element identified by the path.
      // If the element cannot be found in the caller (the owner view), then
      // search the entire document.
      } else {
        var ret = (this.$$sel) ? this.$$sel(path) : $$sel(path) ;

        // if some HTML has been found, then loop through and create views for each 
        // one.  Be sure to setup the proper parent view.
        if (ret) {
          var owner = this ; var views = [] ;
          for(var loc=0;loc<ret.length;loc++) {
            
            // create the new view instance
            var view = viewClass.viewFor(ret[loc], { owner: owner }) ;
            
            // if successful, then we need to determine the new parentNode.
            // then walk up the DOM tree to find the first parent element 
            // managed by a view (including this).
            //
            // If a matching view is not found, but the view IS in a DOM
            // somewhere then make the view a child of either SC.page or 
            // SC.window.
            //  
            // Add the view to the list of child views also.
            //
            if (view && view.rootElement && view.rootElement.parentNode) {
              var node = view.rootElement.parentNode;
              var parentView = null ;

              // go up the chain.  stop when we find a parent view, or the rootElement
              // for SC.page.
              while(node && !parentView) {
                switch(node) {
                case this.rootElement:
                  parentView = this;
                  break ;
                case SC.page.rootElement:
                  parentView = SC.page ;
                  break;
                case SC.window.rootElement:
                  parentView = SC.window ;
                  break; 
                default:
                  node = node.parentNode ; 
                }
              }

              // if a parentView was found, then add to parentView.
              if (parentView) {
                parentView._insertBefore(view,null,false) ;
                parentView._rebuildChildNodes() ; // this is not done with _insertBefore.
                view._updateIsVisibleInWindow();
              }
              
            // view is not in a DOM. nothing to do.
            }

            // add to return array
            views[views.length] = view ;
            
          }
          ret = views ;
          ret = (ret.length == 0) ? null : ((ret.length == 1) ? ret[0] : ret);
        }
        
      }
      
      if (SC.BENCHMARK_OUTLETS) SC.Benchmark.end("OUTLET(%@)".format(path)) ;
      return ret ;
    } ;
    func.isOutlet = true ;
    return func ;
  },
  
  automaticOutletFor: function() {
    var ret = this.outletFor.apply(this, arguments) ;
    ret.autoconfiguredOutlet = YES ;
    return ret ;
  }

}) ;

// IE Specfic Overrides
if (SC.Platform.IE) {
  SC.View.prototype.getStyle = function(style) {
    var element = this.rootElement ;

    // collect value
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    // handle opacity
    if (style === 'opacity') {
      if (value = (this.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/)) {
        if (value[1]) value = parseFloat(value[1]) / 100;
      }
      value = 1.0;
    }

    // handle auto
    if (value === 'auto') {
      switch(style) {
        case 'width':
          if (this.getStyle('display') === 'none') {
            value = null ;
          } else if (element.currentStyle) {
            var paddingLeft = parseInt(element.currentStyle.paddingLeft,0)||0;
            var paddingRight = parseInt(element.currentStyle.paddingRight,0)||0;
            var borderLeftWidth = parseInt(element.currentStyle.borderLeftWidth, 0) || 0 ;
            var borderRightWidth = parseInt(element.currentStyle.borderRightWidth, 0) || 0 ;
            value = (element.offsetWidth - paddingLeft - paddingRight - borderLeftWidth - borderRightWidth) + 'px' ;
          }
          break ;
        case 'height':
          if (this.getStyle('display') === 'none') {
            value = null ;
          } else if (element.currentStyle) {
            var paddingTop = parseInt(element.currentStyle.paddingTop,0)||0;
            var paddingBottom = parseInt(element.currentStyle.paddingBottom,0)||0;
            var borderTopWidth = parseInt(element.currentStyle.borderTopWidth, 0) || 0 ;
            var borderBottomWidth = parseInt(element.currentStyle.borderBottomWidth, 0) || 0 ;
            value = (element.offsetHeight - paddingTop - paddingBottom - borderTopWidth - borderBottomWidth) + 'px' ;
          }

          break ;
        default:
          value = null ;
      }
    }

    return value;
  };
  
  // Called from innerFrame to actually collect the values for the innerFrame.
  // Normally the value we want for the width/height is stored in clientWidth/
  // height but in IE this is only good if the element hasLayout.  In this
  // case always use the scrollWidth/Height.
  SC.View._collectInnerFrame = function() {
    var el = this.rootElement ;
    var hasLayout = (el.currentStyle) ? el.currentStyle.hasLayout : NO ;
    var borderTopWidth = parseInt(el.currentStyle.borderTopWidth, 0) || 0 ;
    var borderBottomWidth = parseInt(el.currentStyle.borderBottomWidth, 0) || 0 ;
    var scrollHeight = el.offsetHeight-borderTopWidth-borderBottomWidth;
    if(el.clientWidth > el.scrollWidth)
    {
      scrollHeight-15;
    }
    
    return { 
      x: el.offsetLeft, 
      y: el.offsetTop, 
      width: (hasLayout) ? Math.min(el.scrollWidth, el.clientWidth) : el.scrollWidth, 
      height: (hasLayout) ? Math.min(scrollHeight, el.clientHeight) : scrollHeight
    };
  } ;
  
} else {
  
  // Called from innerFrame to actually collect the values for the innerFrame.
  // This method should return the smaller of the scrollWidth/height (which
  // will be set if the element is scrollable), or the clientWdith/height 
  // (which is set if the element is not scrollable).
  SC.View._collectInnerFrame = function() {
    var el = this.rootElement ;
    return { 
      x: el.offsetLeft, 
      y: el.offsetTop, 
      width: Math.min(el.scrollWidth, el.clientWidth), 
      height: Math.min(el.scrollHeight, el.clientHeight) 
    };
  } ;
}


// this handler goes through the guid to avoid any potential memory leaks
SC.View._onscroll = function(evt) { $view(this)._onscroll(evt); } ;

SC.View.WIDTH_PADDING_STYLES = ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'];

SC.View.HEIGHT_PADDING_STYLES = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth'];

SC.View.SCROLL_WIDTH_PADDING_STYLES = ['borderLeftWidth', 'borderRightWidth'];
SC.View.SCROLL_HEIGHT_PADDING_STYLES = ['borderTopWidth', 'borderBottomWidth'];

SC.View.elementFor = SC.View.viewFor ; // Old Sprout Compatibility.

// This div is used to create nodes.  It should normally remain empty.
SC._ViewCreator = document.createElement('div') ;

// This div can be used to hold elements you don't want on the page right now.
SC.NodeCache = document.createElement('div') ;
