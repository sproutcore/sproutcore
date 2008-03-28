// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;
require('foundation/responder') ;
require('foundation/node_descriptor') ;
require('foundation/binding');
require('foundation/path_module');

BENCHMARK_OUTLETS = NO ;
SC.FIXED = 'fixed';
SC.FLEXIBLE = 'flexible';

/** 
  @class Manages a DOM element for display.
  
  Views are how you interact with the DOM.
  
  @extends SC.Responder
*/
SC.View = SC.Responder.extend(SC.PathModule, 
  /** @scope SC.View.prototype */
  {

  // ..........................................
  // VIEW API
  //
  // The methods in this section are used to manage actual views.  You can
  // basically interact with child elements in two ways.  One using an API
  // similar to the DOM API.  Alternatively, you can treat the view like an
  // array and use standard iterators.
  //

  /*  
    insert the view before the specified view.  pass null to insert at the
    end.
  */
  insertBefore: function(view, beforeView) { 
    this._insertBefore(view,beforeView,true);
  },
  
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

      // update parent state.
      view._updateIsVisibleInWindow() ;
    }

    
    // call notices.
    view.didAddToParent(this, beforeView) ;
    this.didAddChild(view, beforeView) ;
    
    return this ;
  },
  
  // remove the current child
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

    // update parent state.
    view._updateIsVisibleInWindow() ;

    
    view.set('nextSibling', null);
    view.set('previousSibling', null);
    view.set('parentNode', null) ;
    view.didRemoveFromParent(this) ;
    this.didRemoveChild(view);
  },
  
  // replace the oldView with the new view.
  replaceChild: function(view, oldView) {
    this.insertBefore(view,oldView) ; this.removeChild(oldView) ;
  },
  
  // remove the receiver from the parent view.  Safe to call even if there
  // is no parent node.
  removeFromParent: function() {
    if (this.parentNode) this.parentNode.removeChild(this) ;    
  },
  
  // add a child to the end of the current views.
  appendChild: function(view) {
    this.insertBefore(view,null) ;    
  },
  
  // this array contains the childViews associated with this view.  You should
  // always access this via a GET.
  childNodes: [],
  
  // the first child in the chain.
  firstChild: null,
  
  // the last child in the chain. 
  lastChild: null,
  
  // the next child view. access via a get()
  nextSibling: null,

  // the previous view
  previousSibling: null,

  // the parent node.  null if not in the hierarchy.
  parentNode: null,
  
  
  pane: function()
  {
    var view = this;
    while(view = view.get('parentNode'))
    {
      if (view.get('isPane') ) break;
    }
    return view;
  }.property(),
  
  
  // This will remove all child views.
  clear: function() {
    while(this.firstChild) this.removeChild(this.firstChild) ;
  },
  
  // This callback is invoke just before your view is added to a new parent.
  willAddToParent: function(parent, beforeView) {},
  
  // This callback is invoked just after your view added to a new parent.
  didAddToParent: function(parent, beforeView) {},
  
  // This callback is invoked just before your view is removed from a parent.
  willRemoveFromParent: function() {},
  
  // This callback is invoked just after your view is remove from a parent.
  didRemoveFromParent: function(oldParent) {},

  // This callback is invoked just before a new child is added to view.
  willAddChild: function(child, beforeView) {},
  
  // This callback is invoked just after a new child is added to a view.
  didAddChild: function(child, beforeView) {},
  
  // This callback is invoke just before a child is removed from a view.
  willRemoveChild: function(child) {},
  
  // This callback is invoked this just after a child is removed from a view.
  didRemoveChild: function(child) {},
  
  
  nextKeyView: null,
  previousKeyView: null,
  
  nextValidKeyView: function()
  {
    var view = this;
    while (view = view.get('nextKeyView'))
    {
      if (view.get('isVisible') && view.get('acceptsFirstResponder')) return view;
    }
    return null;
  },
  previousValidKeyView: function()
  {
    var view = this;
    while (view = view.get('previousKeyView'))
    {
      if (view.get('isVisible') && view.get('acceptsFirstResponder')) return view;
    }
    return null;
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
  // The methods in this section provide compatibility with the most common 
  // Prototype methods used on elements.  These methods are generally primitives
  // for modifying the underlying DOM element.  You should only use them for
  // INTERNAL VIEW CODE.

  // returns the CSS classNames for the element.
  classNames: function() { 
    return Element.classNames(this.rootElement); 
  }.property(),
  
  // return true if the element has the classname.
  hasClassName: function(className) {
    var ret = Element.hasClassName(this.rootElement,className) ;
    this.propertyDidChange('classNames') ;
    return ret ;
  },

  // add the specified class name.
  addClassName: function(className) {
    var ret = Element.addClassName(this.rootElement,className) ;
    this.propertyDidChange('classNames') ;
    return ret ;
  },
  
  // remove the specified class name.
  removeClassName: function(className) {
    var ret = Element.removeClassName(this.rootElement,className) ;
    this.propertyDidChange('classNames') ;
    return ret ;
  },

  setClassName: function(className, flag) {
    (!!flag) ? this.addClassName(className) : this.removeClassName(className);
  },
  
  // toggler specified class name..
  toggleClassName: function(className) {
    var ret = Element.toggleClassName(this.rootElement,className) ;
    this.propertyDidChange('classNames') ;
    return ret ;
  },

  // scroll the main window to the selected element.
  scrollTo: function() {
    Element.scrollTo(this.rootElement) ;
  },

  // get the named style. (see also style properties)
  getStyle: function(style) {
    return Element.getStyle(this.rootElement,style) ;
  },

  // set the passed styles.
  setStyle: function(styles, camelized) {
    return Element.setStyle(this.rootElement, styles, camelized) ;
  },

  // use this method to update the HTML of an element.  This takes care of 
  // nasties like processing scripts and inserting HTML into a table.  You can
  // also use asHTML, which builds on this method.
  update: function(html) {
    Element.update((this.containerElement || this.rootElement),html) ;
    this.propertyDidChange('asHTML') ;
  },

  // this works like the element getAttribute() except it is standardized 
  // across all browsers.
  getAttribute: function(attrName) {
    return Element.readAttribute(this.rootElement,attrName) ;
  },
  
  setAttribute: function(attrName, value) {
    this.rootElement.setAttribute(atrrName, value) ;
  },
  
  hasAttribute: function(attrName) {
    return Element.hasAttribute(this.rootElement, attrName) ;
  },
  
  // ..........................................
  // DOM API
  //
  // The methods in this section give you some low-level control over how the
  // view interacts with the DOM.  You do not normally need to work with this.
  
  // This is the DOM element actually managed by this view.  This will be set
  // by the view when it is created.  Changing it afterwards will likely 
  // break things.
  rootElement: null,
  
  // Normally when you add child views to your view, their DOM elements will
  // be set as direct children of the root element.  However you can
  // choose instead to designate an alertnative child node using this 
  // property.  Set this to a selector string to begin with.  The first time
  // it is access, the view will convert it to an actual element.  It is not
  // currently safe to edit this property once the view has been created.
  containerElement: null,

  // ..........................................
  // VIEW LAYOUT
  //
  // The following methods can be used to implement automatic resizing.
  // The frame and bounds provides a simple way for you to compute the 
  // location and size of your views.  You can then use the automatic
  // resizing.
  
  
  /**
    Convert a point _from_ the offset parent of the passed view to the current view.

    This is a useful utility for converting points in the coordinate system of
    another view to the coordinate system of the receiver. Pass null for 
    targetView to convert a point from a window offset.  This is the inverse of 
    convertFrameToView().
    
    Note that if your view is not visible on the screen, this may not work.
    
    @param {Point} f The point or frame to convert
    @param {SC.Vew} targetView The view to convert from.  Pass null to convert from window coordinates.
      
    @returns {Point} The converted point or frame
  */
  convertFrameFromView: function(f, targetView) {
    
    // first, convert to root level offset.
    var thisOffset = Element.viewportOffset(this.get('offsetParent')) ;
    var thatOffset = (targetView) ? Element.viewportOffset(targetView.get('offsetParent')) : [0,0] ;
    
    // now get adjustment.
    var adjustX = thatOffset[0] - thisOffset[0] ;
    var adjustY = thatOffset[1] - thisOffset[1] ;
    return { x: (f.x + adjustX), y: (f.y + adjustY), width: f.width, height: f.height  };
  },
  
  /**
    Convert a point _to_ the offset parent of the passed view from the current view.

    This is a useful utility for converting points in the coordinate system of
    the receiver to the coordinate system of another view. Pass null for 
    targetView to convert a point to a window offset.  This is the inverse of 
    convertFrameFromView().
    
    Note that if your view is not visible on the screen, this may not work.
    
    @param {Point} f The point or frame to convert
    @param {SC.Vew} targetView The view to convert to.  Pass null to convert to window coordinates.
      
    @returns {Point} The converted point or frame
  */
  convertFrameToView: function(f, sourceView) {
    // first, convert to root level offset.
    var thisOffset = Element.viewportOffset(this.get('offsetParent')) ;
    var thatOffset = (sourceView) ? Element.viewportOffset(sourceView.get('offsetParent')) : [0,0] ;
    
    // now get adjustment.
    var adjustX = thisOffset[0] - thatOffset[0] ;
    var adjustY = thisOffset[1] - thatOffset[1] ;
    return { x: (f.x + adjustX), y: (f.y + adjustY), width: f.width, height: f.height };
  },

  // if a view isPositioned, then you can manually control the size and 
  // origin of the view using the frame property.  If isPositioned is false,
  // then this view will be sized and positioned by the browser using CSS.
  // You can read the current frame, but you cannot make edits.
  //
  // You can edit the innerFrame of a view anytime, even if the element is 
  // not positioned.
  //
  isPositioned: false,

  changePositionObserver: function() {
    var isPositioned = this.get('isPositioned') ;
    if (this._wasPositioned == isPositioned) return ;
    
    // make absolute positioned.  Also get default frame.  
    if (isPositioned) {
      var el = this.rootElement;
      this.cacheFrame();
      
      this.setStyle({ 
        position: 'absolute',
        top:    Math.floor(this._frame.y) + 'px',
        left:   Math.floor(this._frame.x) + 'px',
        width:  Math.floor(this._frame.width) + 'px',
        height: Math.floor(this._frame.height) + 'px'
      }) ;
      
    } else {
      var el = this.rootElement;
      el.style.position = 
      el.style.top = 
      el.style.left = 
      el.style.width = 
      el.style.height = '' ;
      this._frame = null ;
    }
    this._wasPositioned = isPositioned ;
  }.observes('isPositioned'),
  
  // Normally we don't get the dimensions of a view until you actually ask
  // for them.  However, sometimes you need to get the frame before you 
  // remove the view from the parent, etc.  This will cache the frame.  
  cacheFrame: function() {
    if (this._frame || this._frameCached) return ; // don't cache twice
    
    var el = this.rootElement ;
    this._frame = Element.getDimensions(el);
    this._frame.x = el.offsetLeft ;
    this._frame.y = el.offsetTop ;
    this._frameCached = true ;
  },
  
  // if you cached the frame, you can use this to clear that cache so that it
  // will now track with the frame in the document.
  flushFrameCache: function() {
    this._frame = null ;
    this._frameCached = false;
  },
  
  // This property returns a DOM ELEMENT that is the offset parent for
  // this view's frame coordinates.  Depending on your CSS, this parent
  // may or may not match with the parent view.
  offsetParent: function() {
    return Position.offsetParent(this.rootElement) ;
  }.property(),
  
  // This property is used to set the internal padding of an element. The
  // innerFrame is an offset from the outer frame.  Changing these settings
  // will adjust the height, width, and padding of the element.
  innerFrame: function(key, value) {
    
    // get the basic inner framce
    var el = this.rootElement ;
    var f = {
      x: parseInt(this.getStyle('padding-left'),0) || 0,
      y: parseInt(this.getStyle('padding-top'), 0) || 0,
      width: parseInt(this.getStyle('width'), 0) || 0, 
      height: parseInt(this.getStyle('height'),0) || 0
    } ;

    // get the current frame size.
    var size = {
      width: f.x + f.width + parseInt(this.getStyle('padding-right'),0),
      height: f.y + f.height + parseInt(this.getStyle('padding-bottom'),0)
    };

    // now update the innerFrame if needed.  Change only the bits that are
    // passed in.
    if (value !== undefined) {
      var style = {} ;
      var didResize = false ;
      var clearFrame = false ;

      // reposition X
      if (value.x !== undefined) {
        f.x = value.x ;
        style.paddingLeft = Math.floor(f.x) + 'px' ;
      }

      // reposition Y
      if (value.y !== undefined) {
        f.y = value.y ;
        style.paddingTop = Math.floor(f.y) + 'px' ;
      }

      // resize Width
      // adjust both the element width and padding right so that the overall
      // frame size does not change.
      if (value.width !== undefined) {
        didResize = true ;
        f.width = value.width ;
        style.width = Math.floor(f.width).toString() + 'px' ;
        
        var padding = size.width - f.width - f.x ;
        if (padding < 0) {
          clearFrame = true ;
          padding = 0 ;
        }
        style.paddingRight = Math.floor(padding).toString() + 'px' ;
      }
      
      // Resize Height
      // adjust both the element height and padding bottom so that the 
      // overall frame size does not change.
      if (value.height !== undefined) {
        didResize = true ;
        f.height = value.height ;
        style.height = Math.floor(f.height).toString() + 'px' ;

        var padding = size.height - f.height - f.y ;
        if (padding < 0) {
          clearFrame = true ;
          padding = 0 ;
        }
        style.paddingBottom = Math.floor(padding).toString() + 'px' ;
      }

      // now apply style change
      this.setStyle(style) ;
      
      // if the user sets an innerFrame size that cannot fit within the 
      // current outer frame, then the outer frame will be adjusted to fit.
      // clear the frame so that this can happen.
      if (clearFrame) {
        this.propertyWillChange('frame') ;
        this._frame = null ;
        this.propertyDidChange('frame') ;
      }

      // also notify children so they can resize also.
      if (didResize) this.resizeChildrenWithOldSize(size) ;
    }

    // finally return the frame. 
    return f ;  
  }.property('frame'),
  
  innerSize: function(key, value) {
    if (value !== undefined) {
      this.set('innerFrame',{ width: value.width, height: value.height }) ;
    }
    return this.get('innerFrame') ;
  }.property('innerFrame'),
  
  innerOrigin: function(key, value) {
    if (value !== undefined) {
      this.set('innerFrame',{ x: value.x, y: value.y }) ;
    }
    return this.get('innerFrame') ;
  }.property('innerFrame'),
  
  // This property identifies the height and offset of your view with 
  // respect to the parent view and its bounds.  To resize your view, edit
  // this property.
  //
  // This method is carefully constructed to use the computed CSS style 
  // until you actually override it by setting your own size and location
  // at which point it will use its own settings.
  frame: function(key, value) {

    // build frame
    var el = this.rootElement ;
    var f = Object.clone(this._frame) ;
    if (f.x === undefined) f.x = el.offsetLeft ;
    if (f.y === undefined) f.y = el.offsetTop ;
    
    // get the current size if needed.
    var size ;
    if ((f.width === undefined) || (f.height === undefined)) {
      var isVisibleInWindow = this.get('isVisibleInWindow') ;

      // if not visible in window, move parent node into window and get 
      // dim and offset.  If the element has no parentNode, then just move
      // the element in.
      if (!isVisibleInWindow) {
        var pn = el.parentNode || el ;
        var pnParent = pn.parentNode ;
        var pnSib = pn.nextSibling ;
        SC.window.rootElement.insertBefore(pn, null) ;
      }
      
      size = Element.getDimensions(el);
      f.width = size.width ;
      f.height = size.height;
      
      if (!isVisibleInWindow) {
        if (pnParent) {
          pnParent.insertBefore(pn, pnSib) ;
        } else SC.window.removeChild(pn) ;
      }
    } else size = f ;

    // now update the frame if needed.  Only actually change the style for
    // those parts of the frame that were passed in.
    if (value !== undefined) {
      var style = {} ;
      var didResize = false ;

      // reposition X
      if (value.x !== undefined) {
        f.x = value.x ;
        style.left = Math.floor(f.x) + 'px' ;
      }

      // reposition Y
      if (value.y !== undefined) {
        f.y = value.y ;
        style.top = Math.floor(f.y) + 'px' ;
      }
      
      // Resize width
      if (value.width !== undefined) {
        didResize = true ;
        f.width = value.width ;
        var padding = parseInt(this.getStyle('padding-left'),0) + parseInt(this.getStyle('padding-right'),0) ;
        style.width = (Math.floor(f.width) - padding).toString() + 'px' ;
      }
      
      // Resize Height
      if (value.height !== undefined) {
        didResize = true ;
        f.height = value.height ;
        var padding = parseInt(this.getStyle('padding-top'),0) + parseInt(this.getStyle('padding-bottom'),0) ;
        style.height = (Math.floor(f.height) - padding).toString() + 'px' ;
      }

      // now apply style change and save new frame.
      this.setStyle(style) ;
      this._frame = Object.clone(f) ;

      // also notify children so they can resize also.
      if (didResize) this.resizeChildrenWithOldSize(size) ;
    }

    // finally return the frame. 
    return f ;
  }.property('innerFrame'),
  
  size: function(key, value) {
    if (value !== undefined) {
      this.set('frame',{ width: value.width, height: value.height }) ;
    }
    return this.get('frame') ;
  }.property('frame'),
  
  origin: function(key, value) {
    if (value !== undefined) {
      this.set('frame',{ x: value.x, y: value.y }) ;
    }
    return this.get('frame') ;
  }.property('frame'),
  
  /**
    The current scroll frame for the view.
    
    This will tell you the total scroll height and width of the view as well
    as any current scroll offset.  You can also set the x and y properties of
    the scrollFrame.  Any changes to height and width will be ignored.
    
    @returns frame
  */
  scrollFrame: function(key, value) {  
    var el = this.rootElement ;
    if (value !== undefined) {
      el.scrollTop = value.y ;
      el.scrollLeft = value.x ;
    }

    return { x: el.scrollLeft, y: el.scrollTop, height: el.scrollHeight, width: el.scrollWidth } ;
  }.property('frame'),
  
  // called on the view when you need to resize your child views.  Normally
  // this will call resizeWithOldParentSize() on the child views, but you
  // can override this to do whatever funky layout to want.
  resizeChildrenWithOldSize: function(oldSize) {
    var child = this.get('firstChild') ;
    while(child) {
      child.resizeWithOldParentSize(oldSize) ;
      child = child.get('nextSibling') ;
    }
  },
  
  // called by the parentNode when it is resized.  If you define the
  // resizeOptions property, then this will respect those properties, 
  // otherwise it will let the browser do all the resizing and simply informs
  // the child views that they need to resize also.
  resizeWithOldParentSize: function(oldSize) {
    var opts = this.get('resizeOptions') ;
    
    // if there are no options, then just notify the children and return.
    if (opts == null) {
      if (this.firstChild) {
        var oldSize = (this._frame) ? { width: this._frame.width, height: this._frame.height } : this.get('size') ;
        this.resizeChildrenWithOldSize(oldSize) ;
      }
      return ;
    }

    // if there are options, then handle the resizing.  This will 
    // notify the children also.
    if (this.get('isPositioned')) this.set('isPositioned',true) ;
    
    var f = Object.clone(this.get('frame')) ;
    var newSize = this.get('parentNode').get('size') ;
    
    var adjust = function(props, apts, newSize, oldSize) {
      var loc ;
      
      // first, compute the dimensions for old size.
      var dims = [f[apts[0]], f[apts[1]]] ;
      dims.push(oldSize - (dims[0] + dims[1])) ;
      
      // next, subtract the dimensions of fixed elements from the old and
      // new sizes.
      for(loc=0;loc < 3;loc++) {
        if (opts[props[loc]] != SC.FLEXIBLE) {
          newSize -= dims[loc]; oldSize -= dims[loc] ;
        }
      }
      
      // finally, adjust the flexible area as a percentage of the limited
      // dimensions.
      for(loc=0;loc < 2; loc++) {
        if (opts[props[loc]] == SC.FLEXIBLE) {
          f[apts[loc]] = newSize * dims[loc] / oldSize ;
        }
      }
    };
    
    // handle horizontal
    adjust(['left','width','right'], ['x','width'], newSize.width, oldSize.width) ;

    adjust(['top','height','bottom'], ['y','height'], newSize.height, oldSize.height) ;

    this.set('frame',f) ;
  },
  
  // These properties are provide simple control for autoresizing.  If you
  // set these, then resizeWithOldParentSize() will autoresize for you.
  // The allowed options are: SC.FLEXIBLE, SC.FIXED.
  resizeOptions: null,
  
  // ..........................................
  // PROPERTIES
  //

  // set isVisible to false to hide a view or true to display it.  You can
  // optionally setup a visibleAnimation that will be used to transition the
  // view in and out.
  //
  // If you would instead like to be notified when the view's actual
  // visibility state changes (i.e. when animations are complete) bind to
  // isDisplayVisible.
  isVisible: true,
  isVisibleBindingDefault: SC.Binding.Flag,
  
  // [RO] This property reflects the current display visibility of the view.
  // Usually, this property will mirror the current state of the isVisible
  // property.  However, if your view animates its visibility in and out, then
  // this will not become false until the animation completes.
  displayIsVisible: true,

  // This property is set to true only when the view is (a) in the main DOM
  // hierarchy and (b) all parent nodes are visible and (c) the receiver node
  // is visible.
  isVisibleInWindow: true,
  
  // Localize boolean. This is used if you need toolTips.
  localize: false,
  
  // Tool tip gets applied to the title attribute if set.
  toolTip: '',

  // set this to the HTML you want to use when creating a new element. You
  // can specify the HTML as a string of text, using the NodeDescriptor, or
  // by pointing directly to an element.
  emptyElement: "<div></div>",
  
  // Set to true and the view will display in a lightbox when you show it.
  isPanel: false,

  // Set to true if the view should be modal when shown as a panel.
  isModal: true,
  
  // Enable visible animation by default.
  isAnimationEnabled: true,

  // General support for animation.  Just call this method and it will build
  // and play an animation starting from the current state.  The second param
  // is optional.  It should either be a hash of animator options or an 
  // animator object returned by a previous call to transitionTo().
  //
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
  
  // returns the contents of the element as HTML.  Accounts for browser
  // bugs.
  asHTML: function(key, value) {
    if (value !== undefined) {
      // Safari2 has a bad habit of sometimes not actually changing its 
      // innerHTML. This will make sure the innerHTML get's changed properly.
      if (SC.isSafari() && !SC.isSafari3()) {
        var el = (this.containerElement || this.rootElement) ; var reps = 0 ;
        var f = function() {
          el.innerHTML = '' ; el.innerHTML = value ;
          if ((reps++ < 5) && (value.length>0) && (el.innerHTML == '')) setTimeout(f,1) ;
        };
        f();
      } else (this.containerElement || this.rootElement).innerHTML = value;
    } else value = (this.containerElement || this.rootElement).innerHTML ;
    return value ;
  }.property(),
  
  // returns the contents of the element as plain text.  Accounts for browser
  // bugs.
  asText: function(key, value) {
    if (value !== undefined) {
      if (value == null) value = '' ;
      this.asHTML(key,value.toString().escapeHTML()) ;
    }
    return this.asHTML().unescapeHTML() ;
  }.property(),




  //
  // Command methods (used by the command manager)
  //

  /**
  * Queries to see if the view has function matching the passed name .
  * @param {String} name The name of the function
  * @return Boolean
  **/
  hasNamedFunction: function( name )
  {
    return ( this[name] && ($type(this[name]) == T_FUNCTION) );
  },
  /**
  * Queries to see if the view has a named command.
  * @param {String} name The name of the command
  * @return Boolean
  **/
  hasCommand: function( name )
  {
    return this.hasNamedFunction(name);
  },
  /**
  * Queries to see if the view has a validator for the named command.
  * @param {String} name The name of the command
  * @return Boolean
  **/
  hasCommandValidator: function( name )
  {
    var name = this._commandValidatorForCommand(name);
    return this.hasNamedFunction(name);
  },

  /**
  * Queries to see if the view is capable of executing a named command.
  * The view must have a method named after the command and, if there is a command validator method, it must pass validation.
  * @param {String} name The name of the command
  * @return Boolean
  **/
  canExecuteCommand: function( name )
  {
    var hasCommand          = this.hasCommand(name);
    var hasCommandValidator = this.hasCommandValidator(name);
    // can't execute what you haven't got...
    if ( !hasCommand ) return false;
    // got it and not validating before usage... 
    if ( hasCommand && !hasCommandValidator ) return true;
    // ok... we got it, and we need to check before using...
    if ( hasCommand && hasCommandValidator )
    {
      return this.executeCommandValidator(name);
    }
  },
  /**
  * Executes the command (if permitted).
  * @param {String} name The name of the command
  * @return Boolean Either the return value of executing the command, or false.
  **/
  executeCommand: function( name )
  {
    return this.canExecuteCommand(name) ? this.executeCommandWithoutValidation(name) : false;
  },
  /**
  * Executes the command without performing any validation.
  * @param {String} name The name of the command
  * @return Boolean The return value of executing the command.
  **/
  executeCommandWithoutValidation: function( name )
  {
    return this[name]();
  },
  /**
  * Executes the command validator.
  * @param {String} name The name of the command to be validated.
  * @return Boolean Wether or not the command can be executed.
  **/
  executeCommandValidator: function( name )
  {
    var name = this._commandValidatorForCommand(name);
    return this[name]();
  },

  /**
  * Utility to construct the command alidator method name.
  * @private
  * @param {String} name The name of the command
  * @return String
  **/
  _commandValidatorForCommand: function( name )
  {
    return "can" + name.capitalize();
  },




  // ..........................................
  // SUPPORT METHODS
  //
  init: function() {
    this._frame = {} ;    
    arguments.callee.base.call(this) ;

    // configure them outlets.
    var r = SC.idt.active ; var idtStart ; var idtSt ;
    if (r) { idtSt = new Date().getTime(); }
    this.configureOutlets() ;
    if (r) { SC.idt.conf_t += ((new Date().getTime()) - idtSt); }

    var toolTip = this.get('toolTip') ;
    if(toolTip && (toolTip != '')) this._updateToolTipObserver();
    
    // despite what was written in the comments for the containerElement property, it was not being converted 
    // from a sring to an element on access... doing so here...
    // shouldn't be a bottleneck since if containerElement is set, you are likely to need the DOM element at some point.
    if ( this.containerElement && (SC.typeOf(this.containerElement) == T_STRING) )
    {
      this.containerElement = this.$sel(this.containerElement);
    }
    
    if (this.get('isDropTarget')) SC.Drag.addDropTarget(this) ;
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
      
      // if the HTML for the view is already in the DOM, then walk up the
      // DOM tree to find the first parent element managed by a view (incl
      // the receiver.  Add the view to the list of child views also.
      if (view && view.rootElement && view.rootElement.parentNode) {
        var node = view.rootElement.parentNode;
        var parentView ;
        while(node && (node != this.rootElement) && !(parentView = $view(node))) node = node.parentNode;
        if (node == this.rootElement) parentView = this;
        if (parentView) parentView._insertBefore(view,null,false) ;
      }
      this._rebuildChildNodes() ; // this is not done with _insertBefore.

      // update parent state.
      if (view && view._updateIsVisibleInWindow) {
        view._updateIsVisibleInWindow() ;
      } 
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
  },
  
  toString: function() {
    var el = this.rootElement ;
    var attrs = el.attributes ;
    attrs = (attrs) ? $A(attrs).map(function(atr) { return [atr.nodeName,atr.nodeValue].join("="); }).join(' ') : '';
    var tagName = (!!el.tagName) ? el.tagName.toLowerCase() : 'document' ;
    return "View(<%@>)".format([tagName,attrs].join(' ')) ;
  }
    
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
    var args = $A(arguments) ; args[0] = { rootElement: el } ;
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
    var args = $A(arguments) ;
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
  
  // define your view as an outlet.
  outletFor: function(path) {
    var view = this ;
    var _func = function() {
      if (path === null) return view.viewFor(null) ;

      
      var ret = (this.$$sel) ? this.$$sel(path) : $$sel(path) ;
      if (ret) {
        var owner = this ;
        var newRet = [] ;
        for(var loc=0;loc<ret.length;loc++) {
          newRet.push(view.viewFor(ret[loc], { owner: owner })); 
        }
        ret = newRet ;
        ret = (ret.length == 0) ? null : ((ret.length == 1) ? ret[0] : ret);
      }

      return ret ;
    } ;
    
    var func ;
    if (BENCHMARK_OUTLETS) {
      func = function() {
        var that = this ;
        return SC.Benchmark._bench(function() {
          return _func.call(that);
        }, "OUTLET(%@)".format(path)) ;
      };
    } else func = _func ;    
    func.isOutlet = true ;
    return func ;
  }  

}) ;

SC.View.elementFor = SC.View.viewFor ; // Old Sprout Compatibility.

// This div is used to create nodes.  It should normally remain empty.
SC._ViewCreator = document.createElement('div') ;

// This div can be used to hold elements you don't want on the page right now.
SC.NodeCache = document.createElement('div') ;
