// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

// These are helpful utility functions for calculating range and rect values


SC.mixin( 
/** @scope SC */
{

  _downloadFrames: 0, // count of download frames inserted into document
  
  /**
    Starts a download of the file at the named path.
    
    Use this method when you want to cause a file to be downloaded to a users
    desktop instead of having it display in the web browser.  Note that your
    server must return a header indicating that the file is intended for 
    download also.
  */
  download: function(path) {
    var tempDLIFrame=document.createElement('iframe');
    var frameId = 'DownloadFrame_' + this._downloadFrames;
    tempDLIFrame.setAttribute('id',frameId);
    tempDLIFrame.style.border='10px';
    tempDLIFrame.style.width='0px';
    tempDLIFrame.style.height='0px';
    tempDLIFrame.style.position='absolute';
    tempDLIFrame.style.top='-10000px';
    tempDLIFrame.style.left='-10000px';    
    // Don't set the iFrame content yet if this is Safari
    if (!(SC.isSafari())) {
      tempDLIFrame.setAttribute('src',path);
    }
    document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
    if (SC.isSafari()) {
      tempDLIFrame.setAttribute('src',path);    
    }
    this._downloadFrames = this._downloadFrames + 1;
    if (!(SC.isSafari())) {
      var r = function() { 
        document.body.removeChild(document.getElementById(frameId)); 
        frameId = null;
      } ;
      var t = r.invokeLater(null, 2000);
    }
    //remove possible IE7 leak
    tempDLIFrame = null;
  },

  /**
    Takes a URL of any type and normalizes it into a fully qualified URL with
    hostname.  For example:
    
    {{{
      "some/path" => "http://localhost:4020/some/path" 
      "/some/path" => "http://localhost:4020/some/path"
      "http://localhost:4020/some/path" => "http://localhost:4020/some/path"
    }}}
    
    @param url {String} the URL
    @returns {String} the normalized URL
  */
  normalizeURL: function(url) {
    if (url.slice(0,1) == '/') {
      url = window.location.protocol + '//' + window.location.host + url ;
    } else if ((url.slice(0,5) == 'http:') || (url.slice(0,6) == 'https:')) {
      // no change
    } else {
      url = window.location.href + '/' + url ;
    }
    return url ;
  },
  
  
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
    
    If you pass NULL to this method, it will return a { x:0, y:0 }
    @param el The DOM element
    @returns {Point} A hash with x,y offsets.
  */
  viewportOffset: function(el) {
    var valueL = 0 ; var valueT = 0;

    // add up all the offsets for the element.
    var element = el ;
    var isFirefox3 = SC.Platform.Firefox >= 3 ;
    while (element) {
      valueT += (element.offsetTop  || 0);
      if (!isFirefox3 || (element !== el)) {
        valueT += (element.clientTop  || 0);
      }

      valueL += (element.offsetLeft || 0);
      if (!isFirefox3 || (element !== el)) {
        valueL += (element.clientLeft || 0);
      }

      // bizarely for FireFox if your offsetParent has a border, then it can 
      // impact the offset. 
      if (SC.Platform.Firefox) {
        var overflow = Element.getStyle(element, 'overflow') ;
        if (overflow !== 'visible') {
          var left = parseInt(Element.getStyle(element, 'borderLeftWidth'),0) || 0 ;
          var top = parseInt(Element.getStyle(element, 'borderTopWidth'),0) || 0 ;
          if (el !== element) {
            left *= 2; top *= 2 ;
          }
          valueL += left; valueT += top ;
        }
        
        // In FireFox 3 -- the offsetTop/offsetLeft subtracts the clientTop/
        // clientLeft of the offset parent.
        var offsetParent = element.offsetParent ;
        if ((SC.Platform.Firefox >= 3) && offsetParent) {
          valueT -= offsetParent.clientTop ;
          valueL -= offsetParent.clientLeft;
        }
      }

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent ;

    }

    element = el;
    while (element) {
      if (!Prototype.Browser.Opera || element.tagName == 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
      
      element = element.parentNode ;
    }

    return { x: valueL, y: valueT } ;
  },
  
  /** A Point at {0,0} */
  ZERO_POINT: { x: 0, y: 0 },
  
  /** A zero length range at zero. */
  ZERO_RANGE: { start: 0, length: 0 },

  RANGE_NOT_FOUND: { start: 0, length: -1 },
  
  /** Returns true if the passed index is in the specified range */
  valueInRange: function(value, range) {
    return (range > 0) && (value >= range.start) && (value < (range.start + range.length));  
  },
  
  /** Returns first value of the range. */
  minRange: function(range) { return range.start; },
  
  /** Returns the first value outside of the range. */
  maxRange: function(range) { return (range.length < 0) ? -1 : (range.start + range.length); },
  
  /** Returns the union of two ranges.  If one range is null, the other
   range will be returned.  */
  unionRanges: function(r1, r2) { 
    if ((r1 == null) || (r1.length < 0)) return r2 ;
    if ((r2 == null) || (r2.length < 0)) return r1 ;
    
    var min = Math.min(r1.start, r2.start) ;
    var max = Math.max(SC.maxRange(r1), SC.maxRange(r2)) ;
    return { start: min, length: max - min } ;
  },
  
  /** Returns the intersection of the two ranges or SC.RANGE_NOT_FOUND */
  intersectRanges: function(r1, r2) {
    if ((r1 == null) || (r2 == null)) return SC.RANGE_NOT_FOUND ;
    if ((r1.length < 0) || (r2.length < 0)) return SC.RANGE_NOT_FOUND;
    var min = Math.max(SC.minRange(r1), SC.minRange(r2)) ;
    var max = Math.min(SC.maxRange(r1), SC.maxRange(r2)) ;
    if (max < min) return SC.RANGE_NOT_FOUND ;
    return { start: min, length: max-min };
  },
  
  /** Returns a clone of the range. */
  cloneRange: function(r) { 
    return { start: r.start, length: r.length }; 
  },
  
  /** Returns true if the two passed ranges are equal.  A null value is
    treated like RANGE_NOT_FOUND.
  */
  rangesEqual: function(r1, r2) {
    if (r1===r2) return true ;
    if (r1 == null) return r2.length < 0 ;
    if (r2 == null) return r1.length < 0 ;
    return (r1.start == r2.start) && (r1.length == r2.length) ;
  }
  
}) ;
