// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2007, Sprout Systems, Inc. and contributors.
// ==========================================================================

// These are helpful utility functions.


Object.extend(SC, 
/** @scope SC */
{

  /** Return the left edge of the frame */
  minX: function(frame) { 
    return frame.x; 
  },
  
  /** Return the right edge of the frame. */
  maxX: function(frame) { 
    return frame.x + frame.width; 
  },
  
  /** Return the midpoint of the frame. */
  midX: function(frame) {
    return frame.x + (frame.width / 2) ;
  },
  
  /** Return the top edge of the frame */
  minY: function(frame) {
    return frame.y ;
  },
  
  /** Return the bottom edge of the frame */
  maxY: function(frame) {
    return frame.y + frame.height ;
  },
  
  /** Return the midpoint of the frame */
  midY: function(frame) {
    return frame.y + (frame.height / 2) ;
  },
  
  /** Returns the point that will center the frame X within the passed frame. */
  centerX: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) / 2 ;
  },
  
  /** Return the point that will center the frame Y within the passed frame. */
  centerY: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) /2  ;
  },
  
  /** Check if the given point is inside the rect. */
  pointInRect: function(point, f) {
    return  (point.x >= SC.minX(f)) &&
            (point.y >= SC.minY(f)) &&
            (point.x <= SC.maxX(f)) && 
            (point.y <= SC.maxY(f)) ;
  },
  
  /** Return true if the two frames match.
  
    @param r1 {Rect} the first rect
    @param r2 {Rect} the second rect
    @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
    @returns {Boolean} true if rects match
   */
  rectsEqual: function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    
    if (delta == null) delta = 0.1;
    if (Math.abs(r1.y - r2.y) > delta) return false ; 
    if (Math.abs(r1.x - r2.x) > delta) return false ; 
    if (Math.abs(r1.width - r2.width) > delta) return false ; 
    if (Math.abs(r1.height - r2.height) > delta) return false ; 
    return true ;
  },
  
  /** Returns the insersection between two rectangles. 
  
    @param r1 {Rect} The first rect
    @param r2 {Rect} the second rect
    @returns {Rect} the intersection rect.  width || height will be 0 if they do not interset.
  */
  intersectRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.max(SC.minX(r1), SC.minX(r2)),
      y: Math.max(SC.minY(r1), SC.minY(r2)),
      width: Math.min(SC.maxX(r1), SC.maxX(r2)),
      height: Math.min(SC.maxY(r1), SC.maxY(r2))
    } ;
    
    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },
  
  /** Returns the union between two rectangles
  
    @param r1 {Rect} The first rect
    @param r2 {Rect} The second rect
    @returns {Rect} The union rect.
  */
  unionRects: function(r1, r2) {
    // find all four edges
    var ret = {
      x: Math.min(SC.minX(r1), SC.minX(r2)),
      y: Math.min(SC.minY(r1), SC.minY(r2)),
      width: Math.max(SC.maxX(r1), SC.maxX(r2)),
      height: Math.max(SC.maxY(r1), SC.maxX(r2))
    } ;
    
    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },
  
  /** Duplicates the passed rect.  
  
    This is faster than Object.clone(). 
    
    @param r {Rect} The rect to clone.
    @returns {Rect} The cloned rect
  */
  cloneRect: function(r) {
    return { x: r.x, y: r.y, width: r.width, height: r.height } ;
  },
  
  
  /** Finds the absolute viewportOffset for a given element.
    This method is more accurate than the version provided by prototype.
    
    @param el The DOM element
    @returns {Point} A hash with x,y offsets.
  */
  viewportOffset: function(el) {
    var valueL = 0 ; var valueT = 0;

    // add up all the offsets for the element.
    var element = el ;
    do {
      valueT += (element.offsetTop  || 0) + (element.clientTop  || 0);
      valueL += (element.offsetLeft || 0) + (element.clientLeft || 0);

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = el;
    do {
      if (!Prototype.Browser.Opera || element.tagName == 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return { x: valueL, y: valueT } ;
  },
  
  /** A Point at {0,0} */
  zeroPoint: { x: 0, y: 0 }
  
}) ;
