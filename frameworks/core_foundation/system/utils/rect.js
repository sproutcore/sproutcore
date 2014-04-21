// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
SC.mixin( /** @scope SC */ {
  /** A Point at {0,0} */
  ZERO_POINT: { x: 0, y: 0 },

  /** Check if the given point is inside the rect. */
  pointInRect: function(point, f) {
    return  (point.x >= SC.minX(f)) &&
            (point.y >= SC.minY(f)) &&
            (point.x <= SC.maxX(f)) &&
            (point.y <= SC.maxY(f)) ;
  },

  /** Return true if the two frames match.  You can also pass only points or sizes.

    @param r1 {Rect} the first rect
    @param r2 {Rect} the second rect
    @param delta {Float} an optional delta that allows for rects that do not match exactly. Defaults to 0.1
    @returns {Boolean} true if rects match
   */
  rectsEqual: function(r1, r2, delta) {
    if (!r1 || !r2) return (r1 == r2) ;
    if (!delta && delta !== 0) delta = 0.1;
    if ((r1.y != r2.y) && (Math.abs(r1.y - r2.y) > delta)) return NO ;
    if ((r1.x != r2.x) && (Math.abs(r1.x - r2.x) > delta)) return NO ;
    if ((r1.width != r2.width) && (Math.abs(r1.width - r2.width) > delta)) return NO ;
    if ((r1.height != r2.height) && (Math.abs(r1.height - r2.height) > delta)) return NO ;
    return YES ;
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
      height: Math.max(SC.maxY(r1), SC.maxY(r2))
    } ;

    // convert edges to w/h
    ret.width = Math.max(0, ret.width - ret.x) ;
    ret.height = Math.max(0, ret.height - ret.y) ;
    return ret ;
  },

  /**
    Returns a copy of the passed rect, scaled by the specified scale, centered on the specified origin.

    @param {Rect} rect The rectangle to scale.
    @param {Number|Array|Hash} scale The scale (or [scaleX, scaleY], or { x: scaleX, y: scaleY}) to apply. Defaults to 1.
    @param {Number} originX The horizontal scale origin. Defaults to 0.5 (center).
    @param {Number} originY The vertical scale origin. Defaults to 0.5 (center).
    @returns {Rect} The scaled rect.
  */
  scaleRect: function(rect, scale, originX, originY) {
    // Defaults
    if (scale == null) scale = 1;
    if (originX == null) originX = 0.5;
    if (originY == null) originY = 0.5;

    // Gatekeep: Identity scale.
    if (scale === 1) return SC.cloneRect(rect);

    // Unpack scale.
    var scaleX, scaleY;
    switch (SC.typeOf(scale)) {
      case SC.T_ARRAY:
        scaleX = scale[0];
        scaleY = scale[1];
        break;
      case SC.T_HASH:
        scaleX = scale.x;
        scaleY = scale.y;
        break;
      default:
        scaleX = scale;
        scaleY = scale;
        break;
    }

    var scaledHeight = rect.height * scaleY,
      scaledWidth = rect.width * scaleX,
      dHeight = scaledHeight - rect.height,
      dWidth = scaledWidth - rect.width;
    
    // X and Y positions change depending on the origin of the scale. For example, if the
    // width scales down ten pixels and the origin is 50%, x will move five pixesl (10 * 0.5)
    // to the right.
    var scaledX = rect.x - (dWidth * originX),
      scaledY = rect.y - (dHeight * originY);

    return {
      height: scaledHeight,
      width: scaledWidth,
      x: scaledX,
      y: scaledY
    };
  },

  /**
    Duplicates the passed rect.

    This is faster than Object.clone().

    @param r {Rect} The rect to clone.
    @returns {Rect} The cloned rect
  */
  cloneRect: function(r) {
    return { x: r.x, y: r.y, width: r.width, height: r.height } ;
  },

  /** Returns a string representation of the rect as {x, y, width, height}.

    @param r {Rect} The rect to stringify.
    @returns {String} A string representation of the rect.
  */
  stringFromRect: function(r) {
    if (!r) {
      return "(null)";
    }
    else {
      return '{ x:'+r.x+', y:'+r.y+', width:'+r.width+', height:'+r.height+' }';
    }
  }


});
