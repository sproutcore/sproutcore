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
     for this view and parent them under the drag pane, which has the class 
     name 'sc-ghost-view'.
  
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
  location: {},

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
    if (this.dataSource) return this.dataSource.get('dragDataTypes') || [] ;
    
    // if that fails, get the keys from the data hash.
    var hash = this.data ;
    if (hash) {
      var ret = [];
      for (var key in hash) {
        if (hash.hasOwnProperty(key)) ret.push(key) ;
      }
      return ret ;
    }    
    
    // if that fails, then check to see if the source object is a dataSource.
    var source = this.get('source') ;
    if (source && source.dragDataTypes) return source.get('dragDataTypes') || [] ;
    
    // no data types found. :(
    return [] ; 
  }.property().cacheable(),
  
  /**
    Checks for a named data type in the drag.
    
    @param dataType {String} the data type
    @returns {Boolean} YES if data type is present in dataTypes array.
  */
  hasDataType: function(dataType) {
    return (this.get('dataTypes').indexOf(dataType) >= 0) ;  
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
      return this.dataSource.dragDataForType(this, dataType) ;
      
    // then try to use the data hash.
    } else if (this.data) {
      return this.data[dataType];
      
    // if all else fails, check to see if the source object is a data source.
    } else {
      var source = this.get('source') ;
      if (source && SC.$type(source.dragDataForType) == SC.T_FUNCTION) {
        return source.dragDataForType(this, dataType) ;
        
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
    // create the ghost view
    this._createGhostView() ;
    
    // compute the ghost offset from the original mouse location
    var dragView = this.dragView ;
    var origin = dragView.convertFrameToView(dragView.get('frame'), null) ;
    var pointer = { x: this.event.pageX, y: this.event.pageY } ;
    this.ghostOffset = { x: (pointer.x-origin.x), y: (pointer.y-origin.y) } ;

    // position the ghost view
    this._positionGhostView(this.event) ;
    
    // notify root responder that a drag is in process
    this._ghostView.rootResponder.dragDidStart(this);
    
    var source = this.source ;
    if (source && source.dragDidBegin) source.dragDidBegin(this, pointer) ;
    
    // let all drop targets know that a drag has started
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      ary[idx].tryToPerform('dragStarted', this.event) ;
    }
  },
  
  /**  
    @private
    
    This method is called repeatedly during a mouse drag.  It updates the
    position of the ghost image, then it looks for a current drop target and
    notifies it.
  */
  mouseDragged: function(evt) {
    var scrolled = this._autoscroll(evt) ;
    var loc = this.get('location') ;
    if (!scrolled && (evt.pageX == loc.x) && (evt.pageY == loc.y)) {
      return ; // quickly ignore duplicate calls
    } 
    
    // cache the current location to avoid processing duplicate mouseDragged calls
    this.set('location', { x: evt.pageX, y: evt.pageY }) ;
    
    // reposition the ghostView
    this._positionGhostView(evt) ;

    // STEP 1: Determine the deepest drop target that allows an operation.
    // if the drop target selected the last time this method was called differs
    // from the deepest target found, then go up the chain until we either hit the
    // last one or find one that will allow a drag operation
    var source = this.source ;
    var last = this._lastTarget ;
    var target = this._findDropTarget(evt) ; // deepest drop target
    var op = SC.DRAG_NONE ;
    
    while (target && (target != last) && (op == SC.DRAG_NONE)) {
      // make sure the drag source will permit a drop operation on the named target
      if (target && source && source.dragSourceOperationMaskFor) {
        op = source.dragSourceOperationMaskFor(this, target) ;
      } else op = SC.DRAG_ANY ; // assume drops are allowed
      
      this.sourceDropOperations = op ;

      // now, let's see if the target will accept the drag
      if ((op != SC.DRAG_NONE) && target && target.computeDragOperations) {
        op = op & target.computeDragOperations(this, evt) ;
      } else op = SC.DRAG_NONE ; // assume drops AREN'T allowed
      
      this.dropOperations = op ;

      // if DRAG_NONE, then look for the next parent that is a drop zone
      if (op == SC.DRAG_NONE) target = this._findNextDropTarget(target) ;
    }

    // STEP 2: Refocus the drop target if needed
    if (target != last) {
      if (last && last.dragExited) last.dragExited(this, evt) ;
      
      if (target) {
        if (target.dragEntered) target.dragEntered(this, evt) ;
        if (target.dragUpdated) target.dragUpdated(this, evt) ;
      }
      
      this._lastTarget = target ;
    } else {
      if (target && target.dragUpdated) target.dragUpdated(this, evt) ;
    }
     
    // notify source that the drag moved
    if (source && source.dragDidMove) source.dragDidMove(this, loc) ;
  },
  
  /**
    @private
    
    Called when the mouse is released.  Performs any necessary cleanup and
    executes the drop target protocol to try to complete the drag operation.
  */
  mouseUp: function(evt) {
    var loc = { x: evt.pageX, y: evt.pageY } ;
    var target = this._lastTarget, op = this.dropOperations;
    
    // try to have the drop target perform the drop...
    if (target && target.acceptDragOperation && target.acceptDragOperation(this, op)) {
      op = (target.performDragOperation) ? target.performDragOperation(this, op) : SC.DRAG_NONE ;  
    } else {
      op = SC.DRAG_NONE;
    }
    
    // notify last drop target that the drag exited, to allow it to cleanup
    if (target && target.dragExited) target.dragExited(this, evt) ;
    
    // notify all drop targets that the drag ended
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      ary[idx].tryToPerform('dragEnded', evt) ;
    }
    
    // destroy the ghost view
    this._destroyGhostView() ;
    
    // notify the source that everything has completed
    var source = this.source ;
    if (source && source.dragDidEnd) source.dragDidEnd(this, loc, op) ;
    
    this._lastTarget = null ;
    this._dragInProgress = NO ; // required by autoscroll, which is invoked by a timer
  },
  
  // ..........................................
  // PRIVATE PROPERTIES AND METHODS
  //
  
  _ghostView: null,
  
  // this will create the ghostView and add it to the document.
  _createGhostView: function() {
    var view = this._ghostView = SC.Pane.create({ owner: this }) ;
    view.$().addClass('sc-ghost-view').append(this.dragView.rootElement.cloneNode(true)) ;
    // var f = this.dragView.get('frame') ;
    // console.log('dragView %@ frame is { top: %@, left: %@, width: %@, height: %@ }'.fmt(this.dragView, f.y, f.x, f.width, f.height)) ;
    view.adjust(this.dragView.get('frame')) ;
    view.append() ;  // add to window
  },

  // positions the ghost view underneath the mouse with the initial offset
  // recorded by when the drag started.
  _positionGhostView: function(evt) {
    var loc = { x: evt.pageX, y: evt.pageY } ;
    loc.x -= this.ghostOffset.x ;
    loc.y -= this.ghostOffset.y ;
    this._ghostView.adjust({ top: loc.y, left: loc.x }) ;   
  },
  
  _destroyGhostView: function() {
    if (this._ghostView) {
      this._ghostView.remove() ;
      this._ghostView = null ; // this will allow the GC to collect it.
    }
  },
  
  // Return an array of drop targets, sorted with any nested drop targets
  // at the top of the array.  The first time this method is called during
  // a drag, it will reconstruct this array using the current set of 
  // drop targets.  Afterwards it uses the cached set until the drop
  // completes.
  //
  // This means that if you change the view hierarchy of your drop targets
  // during a drag, it will probably be wrong.
  _dropTargets: function() {
    if (this._cachedDropTargets) return this._cachedDropTargets ;

    // build array of drop targets
    var ret = [] ;
    var hash = SC.Drag._dropTargets ;
    for (var key in hash) {
      if (hash.hasOwnProperty(key)) ret.push(hash[key]) ;
    }

    // views must be sorted so that drop targets with the deepest nesting 
    // levels appear first in the array.  The getDepthFor().
    var depth = {} ;
    var dropTargets = SC.Drag._dropTargets ;
    var getDepthFor = function(x) {
      if (!x) return 0 ;
      var guid = SC.guidFor(x);
      var ret = depth[guid];
      if (!ret) {
        ret = 1 ;
        while (x = x.get('parentView')) {
          if (dropTargets[SC.guidFor(x)] !== undefined) ret++ ;
        }
        depth[guid] = ret ;
      }
      return ret ;
    } ;
    
    // sort array of drop targets
    ret.sort(function(a,b) {
      if (a===b) return 0;
      a = getDepthFor(a) ;
      b = getDepthFor(b) ;
      return (a > b) ? -1 : 1 ;
    }) ;

    this._cachedDropTargets = ret ;
    return ret ;
  },
  
  // This will search through the drop targets, looking for one in the target area.
  _findDropTarget: function(evt) {
    var loc = { x: evt.pageX, y: evt.pageY } ;
    
    var target, frame ;
    var ary = this._dropTargets() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      target = ary[idx] ;
      
      // FIXME if (!target.get('isVisibleInWindow')) continue ;
      
      // get clippingFrame, converted to the pane.
      frame = target.convertClippingFrameToView(target.get('clippingFrame'), null) ;

      // check to see if loc is inside.  If so, then make this the drop target unless 
      // there is a drop target and the current one is not deeper.
      if (SC.pointInRect(loc, frame)) return target;
    } 
    return null ;
  },
  
  // Search the parent nodes of the target to find another view matching the 
  // drop target.  Returns null if no matching target is found.
  _findNextDropTarget: function(target) {
    var dropTargets = SC.Drag._dropTargets ;
    while (target = target.get('parentView')) {
      if (dropTargets[SC.guidFor(target)]) return target ;
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
    return NO ; // TODO FIXME
    
    // If drag has ended, exit
    if (!this._dragInProgress) return NO;
    
    // STEP 1: Find the first view that we can actually scroll.  This view 
    // must be:
    // - scrollable
    // - the mouse pointer must be within a scrolling hot zone
    // - there must be room left to scroll in that direction. 
    
    // NOTE: an event is passed only when called from mouseDragged
    var loc = (evt) ? { x: evt.pageX, y: evt.pageY } : this.get('location') ;
    var view = this._findScrollableView(loc) ;
    
    // these will become either 1 or -1 to indicate scroll direction or 0 for no scroll.
    var verticalScroll, horizontalScroll ;
    var min, max, edge ;
    var scrollableView = null;

    while (view && !scrollableView) {
      
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
      return YES ;
    } else return NO ;
  },

  // Returns an array of scrollable views, sorted with nested scrollable
  // views at the top of the array.  The first time this method is called
  // during a drag, it will reconstrut this array using the current state of
  // scrollable views.  Afterwards it uses the cached set until the drop
  // completes.
  _scrollableViews: function() {
    if (this._cachedScrollableView) return this._cachedScrollableView ;
    
    // build array of scrollable views
    var ret = [] ;
    var hash = SC.Drag._scrollableViews ;
    for (var key in hash) {
      if (hash.hasOwnProperty(key)) ret.push(hash[key]) ;
    }
    
    // now resort.  This custom function will sort nested scrollable views
    // at the start of the list.
    ret = ret.sort(function(a,b) {
      var view = a;
      while (view = view.get('parentView')) {
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
    var target, frame ;
    var ary = this._scrollableViews() ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      target = ary[idx] ;
      
      // FIXME if (!target.get('isVisibleInWindow')) continue ;
      
      // get clippingFrame, converted to the pane
      frame = target.convertClippingFrameToView(target.get('clippingFrame'), null) ;

      // check to see if loc is inside
      if (SC.pointInRect(loc, frame)) return target;
    } 
    return null ;
  },
  
  // Search the parent nodes of the target to find another scrollable view.
  // return null if none is found.
  _findNextScrollableView: function(view) {
    var scrollableViews = SC.Drag._scrollableViews ;
    while (view = view.get('parentView')) {
      if (scrollableViews[SC.guidFor(view)]) return view ;
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
    Register the view object as a drop target.
    
    This method is called automatically whenever a view is created with the
    isDropTarget property set to YES.  You generally will not need to call it
    yourself.
  */
  addDropTarget: function(target) {
    // console.log('addDropTarget called on %@ with %@'.fmt(this, target));
    this._dropTargets[SC.guidFor(target)] = target ;
  },

  /**
    Unregister the view object as a drop target.
    
    This method is called automatically whenever a view is removed from the 
    hierarchy.  You generally will not need to call it yourself.
  */
  removeDropTarget: function(target) {
    // console.log('removeDropTarget called on %@ with %@'.fmt(this, target));
    delete this._dropTargets[SC.guidFor(target)] ;
  },

  /**
    Register the view object as a scrollable view.  These views will auto-scroll
    during a drag.
  */
  addScrollableView: function(target) {
    this._scrollableViews[SC.guidFor(target)] = target ;  
  },

  /**
    Remove the view object as a scrollable view.  These views will auto-scroll
    during a drag.
  */
  removeScrollableView: function(target) {
    delete this._scrollableViews[SC.guidFor(target)] ;  
  }

});