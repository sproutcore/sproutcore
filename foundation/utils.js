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
    if (delta == null) delta = 0.1;
    if (Math.abs(r1.y - r2.y) > delta) return false ; 
    if (Math.abs(r1.x - r2.x) > delta) return false ; 
    if (Math.abs(r1.width - r2.width) > delta) return false ; 
    if (Math.abs(r1.height - r2.height) > delta) return false ; 
    return true ;
  }
  
}) ;
