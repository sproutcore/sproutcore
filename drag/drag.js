// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('core') ;
require('views/view') ;

SC.DRAG_LINK = 0x0004; SC.DRAG_COPY = 0x0001; SC.DRAG_MOVE = 0x0002;
SC.DRAG_NONE = 0x0000; SC.DRAG_ANY = 0x0007 ;
SC.DRAG_AUTOSCROLL_ZONE_THICKNESS = 20 ;

/**

  @class
  
  An instance of this object is created whenever a drag occurs.  The instance
  manages the mouse events and coordinating with droppable targets until the
  user releases the mouse button. 

  To initiate a drag, you should call SC.Drag.start() with the options below
  specified in a hash. Pass the ones you need to get the drag you want:  
   
  - *event: (req)* The mouse event that triggered the drag.  This will be used 
    to position the element.
  
   - *source: (req)* The drag source object that should be consulted during 
     the drag operations. This is usually the container view that initiated 
     the drag.
  
   - *dragView: (req)*  This should point to a view that will be used as the 
     source image for the drag. The drag operation will clone the DOM elements 
     for this view and add the class name 'drag-image' to the outermost 
     element.
  
   - *ghost:  YES | NO*  If YES or not passed, then drag view image will show, 
     but the source dragView will not be hidden.  set to NO to make it appear 
     that the dragView itself is being dragged around.
  
   - *slideBack: YES | NO*  If YES or not specified, then if the drag 
     operation is cancelled, the dragView will slide back to its source 
     origin.
  
   - *origin:*  If passed, this will be used as the origin point for the 
     ghostView when it slides back.  You normally do not need to pass this 
     unless the ghost view does not appear in the main UI.
  
   - *data:* Optional hash of data types and values.  You can use this to pass 
     a static set of data instead of providing a dataSource.  If you provide
     a dataSource, it will override this.
  
   - *dataSource:*  Optional object that will provide the data for the drag to 
     be consumed by the drop target.  If you do not pass this parameter or the 
     data hash, then the source object will be used if it implements the 
     SC.DragDataSource protocol.
  
   - *anchorView:* if you pass this optional view, then the drag will only be 
     allowed to happen within this view.  The ghostView will actually be added 
     as a child of this view during the drag.  Normally the anchorView is the 
     window.
   
  @extends SC.Object
*/
SC.Drag = SC.Object.extend(
/** @scope SC.Drag.prototype */ {
  
  /** [RO] The source object used to coordinate this drag. */  
  source: null,

  /**  The actual image being dragged around the screen.  
  
    This is created automatically from the dragView.
  */
  ghostView: null,

  /**  
    The view that was used as the source of the ghostView.  
    
    The drag view is not moved from its original location during a drag.
    Instead, the DOM content of the view is cloned and managed by the 
    ghostView.  If you want to visually indicate that the view is being 
    movied, you may want to temporarily hide it during the drag.
  */
  dragView: null,
  
  /**  
    If YES, the dragView is automatically hidden while dragging around the ghost.
  */
  ghost: YES,
  
  /**
    If YES, then the ghostView will slide back to its original location if drag is cancelled.
  */
  slideBack: YES,
  
  /**  The original mouse down event. */
  mouseDownEvent: null,

  /**  
    The origin to slide back to in the coordinate of the dragView's offsetParent.
  */
  ghostOffset: { x: 0, y: 0 },
  
  /**
    The current location of the mouse pointer in window coordinates.  
  
    This is updated as long as the mouse button is pressed.
  */
  location: null,

  // ..........................................
  // DRAG DATA
  //

  /**
    Data types supported by this drag operation.
    
    Returns an array of data types supported by the drag source.  This may 
    be generated dynamically depending on the data source.

    If you are implementing a drag source, you will need to provide these data
    types so that drop targets can detect if they can accept your drag data.
    
    If you are implementing a drop target, you should inspect this property
    on your dragEntered() and prepareForDragOperation() methods to determine 
    if you can handle any of the data types offered up by the drag source.
    
    @field {Array} available data types
  */
  dataTypes: function() {
    
    // first try to use the data source.
    if (this.dataSource) return this.dataSource.get('dragDataTypes') ;
    
    // if that fails, get the keys from the data hash.
    if (this.data) {
      var ret = [];
      for(var key in this._data) {
        if (this.data.hasOwnProperty(key)) ret.push(key) ;
      }
      return ret ;
    }    
    
    // if that fails, then check to see if the source object is a dataSource.
    var source = this.get('source') ;
    if (source && source.dragDataTypes) return source.get('dragDataTypes') ;
    
    // no data types found. :(
    return [] ; 
  }.property(),
  
  /**
    Checks for a named data type in the drag.
    
    @param dataType {String} the data type
    @returns {Boolean} YES if data type is present in dataTypes array.
  */
  hasDataType: function(dataType) {
    var dataTypes = this.get('dataTypes') || [] ;
    return (dataTypes.indexOf(dataType) >= 0) ;  
  },
  
  /**
    Retrieve the data for the specified dataType from the drag source.
  
    Drop targets can use this method during their performDragOperation() method
    to retrieve the actual data provided by the drag data source.  This data
    may be generated dynamically depending on the data source.
    
    @param {Object} dataType data type you want to retrieve.  Should be one of the values returned in the dataTypes property
    
    @returns {Object} The generated data.
  */
  dataForType: function(dataType) {
    
    // first try to use the data Source.
    if (this.dataSource) {
      return this.dataSource.dragDataForType(dataType, this) ;
      
    // then try to use the data hash.
    } else if (this.data) {
      return this.data[dataType];
      
    // if all else fails, check to see if the source object is a data source.
    } else {
      var source = this.get('source') ;
      if (source && $type(source.dragDataForType) == T_FUNCTION) {
        return source.dragDataForType(dataType, this) ;
        
      // no data source found. :(
      } else return null ;
    }
  },
  
  /**
    Optional object used to provide the data for the drag.

    Drag source can designate a dataSource object to generate the data for 
    a drag dynamically.  The data source can and often is the drag source 
    object itself.  

    Data Source objects must comply with the SC.DragDataSource interface.  If
    you do not want to implement this interface, you can provide the data 
    directly with the data property.

    If you are implementing a drop target, use the dataTypes property and 
    dataForTypes() method to access data instead of working directly with these
    properties.
    
    @type {Object}
  */
  dataSource: null,

  /**
    Optional hash of data.  Used if no dataSource was provided.
    
    Drag sources can provide a hash of data when the drag begins instead of 
    specifying an actual dataSource.  The data is stored in this property.
    If you are implementing a drop target, use the dataTypes property and 
    dataForTypes() method to access data instead of working directly with these
    properties.
    
    @type {Object}
  */
  data: null,

  // required by autoscroll
  _dragInProgress: YES,
  
  // this will actually start the drag process.
  startDrag: function() {
    
    // create the ghost view and position.
    this._createGhostView() ;
    
    // compute the offset from the original mouse location.
    var origin = this.dragView.convertFrameToView(this.dragView.get('frame'), null);
    var pointer = Event.pointerLocation(this.event) ;
    
    window.dragEvent = this.event ;
    
    this.ghostOffset = { x: (pointer.x-origin.x), y: (pointer.y-origin.y) };

    // position the ghost view.
    this._positionGhostView(this.event) ;
    
    // notify window a drag is in process. mouseDragged notifications will
    // go to the drag instead.
    SC.window.dragDidStart(this) ;
    
    if (this.source && this.source.dragDidBegin) {
      this.source.dragDidBegin(this, pointer) ;
    }
  },
  
  _lastLoc: {},

  /**  
    @private
    
    This method is called repeatedly during a mouse drag.  It updates the
    position of the ghost image, then it looks for a current drop target and
    notifies it.
  */
  mouseDragged: function(evt) {
    
    var loc = Event.pointerLocation(evt) ;
    var scrolled = this._autoscroll(evt) ;
    
    // ignore duplicate calls.
    if (!scrolled && (loc.x == this._lastLoc.x) && (loc.y == this._lastLoc.y)) return ;
    this._lastLoc = loc ;
    this.set('location', loc) ;

    this._positionGhostView(evt) ;
    var last = this._lastTarget ;

    // STEP 1: Determine the deepest drop target that allows an operation.
    // if the drop target selected the last time this method was called differs
    // from the deepest target found, then go up the chain until we either hit the
    // last one or find one that will allow a drag operation
    var target = this._findDropTarget(evt) ; // deepest drop target
    var op = SC.DRAG_NONE ;
    
    while (target && (target != last) && (op == SC.DRAG_NONE)) {
      
      // make sure the drag source will permit a drop operation on the named target.
      // if source does not implement this callback, just assume a drop is allowed
      // by the source.
      if (target && this.source && this.source.dragSourceOperationMaskFor) {
        op = this.source.dragSourceOperationMaskFor(target, this) ;
      } else op = SC.DRAG_ANY ;

      // now, let's see if the target will accept the drag.  If it does not respond
      // to dragEntered, then assume NO drag opts.
      if ((op != SC.DRAG_NONE) && target && target.dragEntered) {
        op = op & target.dragEntered(this, evt) ;
      } else op = SC.DRAG_NONE ;

      // if DRAG_NONE, then look for the next parent that is a drop zone.
      if (op == SC.DRAG_NONE) target = this._findNextDropTarget(target) ;
    }

    // STEP 2: Refocus the drop target.
    // If a new drop target was found then this part of the method will exit the
    // last drag target and start the new one.
    if (target != last) {

      // if the new target does not match the last target, exit that target.
      if (last && last.dragExited) last.dragExited(this, evt) ;

      if (target && this.source && this.source.dragSourceOperationMaskFor) {
        op = this.source.dragSourceOperationMaskFor(target, this) ;
      } else op = SC.DRAG_ANY ;

      // save new op and set target to null if op = DRAG_NONE
      this.sourceDropOperations = op ;
      
      // now notify the new target, if there is one.  Save the allowed drop
      // operations as the logical AND between the ops allowed by the source
      // and target.
      if (target && target.dragEntered) {
        this.dropOperations = op & target.dragEntered(this, evt) ;
      } else this.dropOperations = SC.DRAG_NONE ;

      if (this.dropOperations == SC.DRAG_NONE) target = null ;
    
    // if nothing has changed, send dragUpdated
    } else {
      if (target && target.dragUpdated) target.dragUpdated(this, evt) ;
    }
     
    // notify source that the drag moved.
    if (this.source && this.source.dragDidMove) {
      this.source.dragDidMove(this, loc) ;
    }   
    
    this._lastTarget = target ;
  },
  
  /**
    @private
    
    Called when the mouse is released.  Performs any necessary cleanup and
    executes the drop target protocol to try to complete the drag operation.
  */
  mouseUp: function(evt) {
    var loc = Event.pointerLocation(evt) ;

    // try to have the drop target perform the drop...
    var target = this._lastTarget ;
    var op = this.dropOperations;
    
    if (target && target.prepareForDragOperation(op, this)) {
      op = target.performDragOperation(op, this) ;  
    } else {
      op = SC.DRAG_NONE;
    }
    
    // create cleanupFunc.  This function will be called at the end of this
    // function or after the ghostView slides back to its origin.
    var drag = this ;
    var cleanupFunc = function() {
      if (target) target.concludeDragOperation(op, this) ;  
      drag._destroyGhostView() ;
    };
    
    // notify drop target.
    if (target && target.dragEnded) target.dragEnded(this, evt) ;
    this._lastTarget = null ;
    
    // clean up ghost view.  if sldeBack is true, then do the animation.
    if ((op == SC.DRAG_NONE) && this.get('slideBack')) {
      var loc = this.dragView.convertFrameToView(this.dragView.get('origin'), null) ;
      this._ghostView.transitionTo(1.0, 
        "left: %@px; top: %@px".fmt(loc.x, loc.y), 
        { duration: 200, onComplete: cleanupFunc }) ;
        
    } else cleanupFunc() ;
    
    // notify the source that everything has completed.
    if (this.source && this.source.dragDidEnd) {
      this.source.dragDidEnd(this, loc, op) ;
    }
    
    this._dragInProgress = NO ; // required by autoscroll.
    
  },
  
  // ..........................................
  // PRIVATE PROPERTIES AND METHODS
  //
  
  _ghostViewClass: SC.View.extend({ 
    emptyElement: '<div class="sc-ghost-view"></div>'
  }),
  
  // positions the ghost view underneath the mouse with the initial offset
  // recorded by when the drag started.
  _positionGhostView: function(evt) {
    var loc = Event.pointerLocation(evt) ;
    loc.x -= this.ghostOffset.x ;
    loc.y -= this.ghostOffset.y ;
    loc = this._ghostView.convertFrameFromView(loc, null) ;
    this._ghostView.set('origin', loc) ;   
  },
  
  // this will create the ghostView and add it to the main HTML document.
  // it will also position it underneath the current mouse location.
  _createGhostView: function() {
    
    // create the elements by cloning the dragView.
    var el = this.dragView.rootElement.cloneNode(true) ;
    
    // create the ghost view instance add ghost class name.
    this._ghostView = this._ghostViewClass.viewFor(el) ;
    this._ghostView.owner = this ;
    this._ghostView.addClassName('sc-ghost-view') ;
    
    // add to bottom of main document body and to window.
    SC.window.appendChild(this._ghostView) ;
  },

  _destroyGhostView: function() {  
    if (this._ghostView) {
      this._ghostView.removeFromParent() ;
      this._ghostView = null ; // this will allow the GC to collect it.
    }
  },
  
  _ghostView: null,
  
  // Return an array of drop targets, sorted with any nested drop targets
  // at the top of the array.  The first time this method is called during
  // a drag, it will reconstruct this array using the current set of 
  // drop targets.  Afterwards it uses the cached set until the drop
  // completes.
  //
  // This means that if you change the view hierarchy of your drop targets
  // during a drag, it will probably be wrong.
  _getOrderedDropTargets: function() {
    if (this._cachedDropTargets) return this._cachedDropTargets ;
    var ret = [];
    
    // build array of drop targets
    var dt = SC.Drag._dropTargets ;
    for(var key in dt) {
      if (!dt.hasOwnProperty(key)) continue ;
      ret.push(dt[key]) ;      
    }

    // views must be sorted so that drop targets with the deepest nesting 
    // levels appear first in the array.  The getDepthFor().
    var depth = {} ;
    var getDepthFor = function(x) {
      if (!x) return 0 ;
      var guid = SC.guidFor(x);
      var ret = depth[guid];
      if (!ret) {
        ret = 1 ;
        while((x = x.parentNode) && (x !== SC.window)) {
          if (dt[SC.guidFor(x)] !== undefined) ret++ ;
        }
        depth[guid] = ret ;
      }
      return ret ;
    } ;

    ret.sort(function(a,b) {
      if (a===b) return 0;
      a = getDepthFor(a) ;
      b = getDepthFor(b) ;
      return (a > b) ? -1 : 1 ;
    }) ;

    this._cachedDropTargets = ret ;
    
    return ret ;
  },
  
  // This will search through the drop targets, looking for one in the 
  // target area.
  _findDropTarget: function(evt) {
    var dt = this._getOrderedDropTargets() ;
    var loc = Event.pointerLocation(evt) ;

    var ret = null ;
    for(var idx=0;idx<dt.length;idx++) {
      var t = dt[idx] ;

      if(!t.get('isVisibleInWindow')) continue ;
      
      // get frame, converted to view.
      var f = t.convertFrameToView(t.get('clippingFrame'), null) ;
      
      // check to see if loc is inside.  If so, then make this the drop
      // target unless there is a drop target and the current one 
      // is not deeper.
      if (SC.pointInRect(loc, f)) return t;
    } 
    return null ;
  },
  
  // Search the parent nodes of the target to find another view matching the 
  // drop target.  Returns null if no matching target is found.
  _findNextDropTarget: function(target) {
    while ((target = target.parentNode) && (target != SC.window)) {
      if (SC.Drag._dropTargets[target._guid]) return target ;
    }
    return null ;
  },
  
  // ............................................
  // AUTOSCROLLING
  //
  
  // Performs auto-scrolling for the drag.  This will only do anything if
  // the user keeps the mouse within a few pixels of one location for a little
  // while.
  //
  // Returns true if a scroll was performed
  _autoscroll: function(evt) {
  
    // If drag has ended, exit
    if (!this._dragInProgress) return ;
    
    // STEP 1: Find the first view that we can actually scroll.  This view 
    // must be:
    // - scrollable
    // - the mouse pointer must be within a scrolling hot zone
    // - there must be room left to scroll in that direction. 
    
    // NOTE: an event is passed only when called from mouseDragged
    var loc = (evt) ? Event.pointerLocation(evt) : this._lastMouseLocation ;
    if (!loc) return false ;
    this._lastMouseLocation = loc ;

    var view = this._findScrollableView(loc) ;
    
    // these will become either 1 or -1 to indicate scroll direction or 0 for no scroll.
    var verticalScroll, horizontalScroll ;
    var min, max, edge ;
    var scrollableView = null;

    while(view && !scrollableView) {
      
      // quick check...can we scroll this view right now?
      verticalScroll = view.get('hasVerticalScroller') ? 1 : 0;
      horizontalScroll = view.get('hasHorizontalScroller') ? 1 : 0;
      
      // at least one direction might be scrollable.  Collect some extra
      // info to investigate further.
      if ((verticalScroll != 0) || (horizontalScroll != 0)) {
        var f = view.convertFrameToView(view.get('frame'), null) ;
        var innerSize = view.get('innerFrame') ;
        var scrollFrame = view.get('scrollFrame') ;
      }
      
      
      if (verticalScroll != 0) {
        
        // bottom hotzone?
        max = SC.maxY(f); min = max - SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ; 
        edge = SC.maxY(scrollFrame) ;
        
        if ((edge >= innerSize.height) && (loc.y >= min) && (loc.y <= max)) {
          verticalScroll = 1 ;
          
        // no...how about top hotzone?
        } else {
          min = SC.minY(f); max = min + SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ;
          edge = SC.minY(scrollFrame) ;
          if ((edge <= innerSize.height) && (loc.y >= min) && (loc.y <= max)) {
            verticalScroll = -1 ;
          
          // no, ok don't scroll vertical
          } else verticalScroll = 0 ;
        }
      }

      if (horizontalScroll != 0) {
        // right hotzone?
        max = SC.maxX(f); min = max - SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ; 
        edge = SC.maxX(scrollFrame) ;
        if ((edge >= innerSize.width) && (loc.x >= min) && (loc.x <= max)) {
          horizontalScroll = 1 ;
          
        // no...how about left hotzone?
        } else {
          min = SC.minY(f); max = min + SC.DRAG_AUTOSCROLL_ZONE_THICKNESS ;
          edge = SC.minY(scrollFrame) ;
          if ((edge <= innerSize.width) && (loc.x >= min) && (loc.x <= max)) {
            horizontalScroll = -1 ;
          
          // no, ok don't scroll vertical
          } else horizontalScroll = 0 ;
        }
      }

      // if we can scroll, then set this.
      if ((verticalScroll != 0) || (horizontalScroll != 0)) {
        scrollableView = view ;
      } else view = this._findNextScrollableView(view) ;
    }

    
    // STEP 2: Only scroll if the user remains within the hot-zone for a period of
    // time
    if (scrollableView && (this._lastScrollableView == scrollableView)) {
      if ((Date.now() - this._hotzoneStartTime) > 100) {
        this._horizontalScrollAmount *= 1.05 ;
        this._verticalScrollAmount *= 1.05 ;
      }
      
    // otherwise, reset everything and disallow scroll
    } else {
      this._lastScrollableView = scrollableView ;
      this._horizontalScrollAmount = 15 ;
      this._verticalScrollAmount = 15 ;
      this._hotzoneStartTime = (scrollableView) ? Date.now() : null ;
      
      horizontalScroll = verticalScroll = 0 ;
    }
    
    // STEP 3: Scroll!
    if (scrollableView && ((horizontalScroll != 0) || (verticalScroll != 0))) {
      var scroll = { 
        x: horizontalScroll * this._horizontalScrollAmount,
        y: verticalScroll * this._verticalScrollAmount 
      } ;

      scrollableView.scrollBy(scroll) ;
      
    }

    // If a scrollable view was found, then reschedule
    if (scrollableView) {
      this.invokeLater('_autoscroll', 100, null);
      return true ;
    } else return false ;
  },

  // Returns an array of scrollable views, sorted with nested scrollable
  // views at the top of the array.  The first time this method is called
  // during a drag, it will reconstrut this array using the current ste of
  // scrollable views.  Afterwards it uses the cached set until the drop
  // completes.
  _scrollableViews: function() {
    if (this._cachedScrollableView) return this._cachedScrollableView ;
    var ret = [];
    
    // build array of drop targets
    var dt = SC.Drag._scrollableViews ;
    for(var key in dt) {
      if (!dt.hasOwnProperty(key)) continue ;
      ret.push(dt[key]) ;      
    }
    
    // now resort.  This custom function will sort nested drop targets
    // at the start of the list.
    ret = ret.sort(function(a,b) {
      var view = a;
      while((view = view.parentNode) && (view != SC.window)) {
        if (b == view) return -1 ;
      }
      return 1; 
    }) ;

    this._cachedScrollableView = ret ;
    
    return ret ;
  },
  
  // This will search through the scrollable views, looking for one in the 
  // target area.
  _findScrollableView: function(loc) {
    var dt = this._scrollableViews() ;

    var ret = null ;
    for(var idx=0;idx<dt.length;idx++) {
      var t = dt[idx] ;

      if(!t.get('isVisibleInWindow')) continue ;
      
      // get frame, converted to view.
      var f = t.convertFrameToView(t.get('frame'), null) ;
      
      // check to see if loc is inside.  
      if (SC.pointInRect(loc, f)) return t;
    } 
    return null ;
  },
  
  // Search the parent nodes of the target to find another scrollable view.
  // return null if none is found.
  _findNextScrollableView: function(view) {
    while ((view = view.parentNode) && (view != SC.window)) {
      if (SC.Drag._scrollableViews[view._guid]) return view ;
    }
    return null ;
  }  
    
  
}) ;

SC.Drag.mixin(
/** @scope SC.Drag */ {
  
   
  /**  
   This is the method you use to initiate a new drag.  See class documentation 
   for more info on the options taken by this method.
   
   @params {Hash} ops a hash of options.  See documentation above.
   
  */
  start: function(ops) {
    var ret = this.create(ops) ;
    ret.startDrag() ;
    return ret ;
  },
  
  _dropTargets: {},
  _scrollableViews: {},
  
  /**
    Register the view object as a scrollable view.  These views will auto-scroll
    during a drag.
  */
  addScrollableView: function(target) {
    this._scrollableViews[target._guid] = target ;  
  },

  /**
    Remove the view object as a scrollable view.  These views will auto-scroll
    during a drag.
  */
  removeScrollableView: function(target) {
    delete this._scrollableViews[target._guid] ;  
  },
  
  /**
    Register the view object as a drop target.
    
    This method is called automatically whenever a view is created with the
    isDropTarget property set to YES.  You generally will not need to call it
    yourself.
  */
  addDropTarget: function(target) {
    this._dropTargets[target._guid] = target ;
  },

  /**
    Remove a view from the list of drop targets.
    
    This method is called automatically whenever a view is removed from the 
    hierarchy.  You generally will not need to call it yourself.
  */
  removeDropTarget: function(target) {
    delete this._dropTargets[target._guid] ;
  },

  /**
    Convenience method to turn a operation mask into a descriptive string.
  */
  inspectOperation: function(op) {
    var ret = [] ;
    if (op === SC.DRAG_NONE) {
      ret = ['DRAG_NONE'];
    } else if (op === SC.DRAG_ANY) {
      ret = ['DRAG_ANY'] ;
    } else {
      if (op & SC.DRAG_LINK) {
        ret.push('DRAG_LINK') ;
      }

      if (op & SC.DRAG_COPY) {
        ret.push('DRAG_COPY') ;
      }

      if (op & SC.DRAG_MOVE) {
        ret.push('DRAG_MOVE') ;
      }
    }
    return ret.join('|') ;
  }

});