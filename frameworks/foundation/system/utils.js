// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// These are helpful utility functions for calculating range and rect values
sc_require('system/browser');

SC.mixin( /** @scope SC */ {

  _downloadFrames: 0, // count of download frames inserted into document
  
  _copy_computed_props: [
    "maxWidth", "maxHeight", "paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
    "fontFamily", "fontSize", "fontStyle", "fontWeight", "fontVariant", "lineHeight",
    "whiteSpace"
  ],
  
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
    SC.$(tempDLIFrame).attr('id',frameId);
    tempDLIFrame.style.border='10px';
    tempDLIFrame.style.width='0px';
    tempDLIFrame.style.height='0px';
    tempDLIFrame.style.position='absolute';
    tempDLIFrame.style.top='-10000px';
    tempDLIFrame.style.left='-10000px';    
    // Don't set the iFrame content yet if this is Safari
    if (!SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);
    }
    document.getElementsByTagName('body')[0].appendChild(tempDLIFrame);
    if (SC.browser.isSafari) {
      SC.$(tempDLIFrame).attr('src',path);    
    }
    this._downloadFrames = this._downloadFrames + 1;
    if (!SC.browser.isSafari) {
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
    return frame.x || 0; 
  },
  
  /** Return the right edge of the frame. */
  maxX: function(frame) { 
    return (frame.x || 0) + (frame.width || 0); 
  },
  
  /** Return the midpoint of the frame. */
  midX: function(frame) {
    return (frame.x || 0) + ((frame.width || 0) / 2) ;
  },
  
  /** Return the top edge of the frame */
  minY: function(frame) {
    return frame.y || 0 ;
  },
  
  /** Return the bottom edge of the frame */
  maxY: function(frame) {
    return (frame.y || 0) + (frame.height || 0) ;
  },
  
  /** Return the midpoint of the frame */
  midY: function(frame) {
    return (frame.y || 0) + ((frame.height || 0) / 2) ;
  },
  
  /** Returns the point that will center the frame X within the passed frame. */
  centerX: function(innerFrame, outerFrame) {
    return (outerFrame.width - innerFrame.width) / 2 ;
  },
  
  /** Return the point that will center the frame Y within the passed frame. */
  centerY: function(innerFrame, outerFrame) {
    return (outerFrame.height - innerFrame.height) /2  ;
  },
  
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
  
  /** Returns a string representation of the rect as {x, y, width, height}.  
    
    @param r {Rect} The rect to stringify.
    @returns {String} A string representation of the rect.
  */
  stringFromRect: function(r) {
    return '{%@, %@, %@, %@}'.fmt(r.x, r.y, r.width, r.height);
  },
  
  /**
    Returns a string representation of the layout hash.

    Layouts can contain the following keys:
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
    
    @param layout {Hash} The layout hash to stringify.
    @returns {String} A string representation of the layout hash.
  */
  stringFromLayout: function(layout) {
    // Put them in the reverse order that we want to display them, because
    // iterating in reverse is faster for CPUs that can compare against zero
    // quickly.
    var keys = ['maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'centerY',
                'centerX', 'width', 'height', 'bottom', 'right', 'top',
                'left'];

    var keyValues = [];
    var i = keys.length;
    while (--i >= 0) {
      var key = keys[i];
      if (layout.hasOwnProperty(key)) {
        keyValues.push(key + ':' + layout[key]);
      }
    }
    
    return '{' + keyValues.join(', ') + '}';
  },
  
  /**
    Given a string and a fixed width, calculates the height of that
    block of text using a style string, a set of class names,
    or both.

    @param str {String} The text to calculate
    @param width {Number} The fixed width to assume the text will fill
    @param style {String} A CSS style declaration.  E.g., 'font-weight: bold'
    @param classNames {Array} An array of class names that may affect the style
    @returns {Number} The height of the text given the passed parameters
  */
  heightForString: function(str, width, style, classNames) {
    var elem = this._heightCalcElement, classes, height;

    // Coalesce the array of class names to one string, if the array exists
    classes = (classNames && SC.typeOf(classNames) === SC.T_ARRAY) ? classNames.join(' ') : '';

    if (!width) width = 100; // default to 100 pixels

    // Only create the offscreen element once, then cache it
    if (!elem) {
      elem = this._heightCalcElement = document.createElement('div');
      document.body.insertBefore(elem, null);
    }

    style = '%@; width: %@px; left: %@px; position: absolute'.fmt(style, width, (-1*width));
    SC.$(elem).attr('style', style);

    if (classes !== '') {
      SC.$(elem).attr('class', classes);
    }

    elem.innerHTML = str;
    height = elem.clientHeight;

    elem = null; // don't leak memory
    return height;
  },
  
  /**
  Given a string and an example element or style string, and an optional
  set of class names, calculates the width and height of that block of text.
  
  To constrain the width, set max-width on the exampleElement or in the style string.
  
  @param string {String} The string to measure.
  @param exampleElement The example element to grab styles from, or the style string to use.
  @param classNames {String} (Optional) Class names to add to the test element.
  */
  metricsForString: function(string, exampleElement, classNames)
  {
    var element = this._metricsCalculationElement, width, height, classes, styles, style;
    
    // collect the class names
    classes = SC.A(classNames).join(' ');
    
    // get the calculation element
    if (!element) {
      element = this._metricsCalculationElement = document.createElement("div");
      document.body.insertBefore(element, null);
    }
    
    // two possibilities: example element or type string
    if (SC.typeOf(exampleElement) != SC.T_STRING) {
      var computed = null;
      if (document.defaultView && document.defaultView.getComputedStyle) {
        computed = document.defaultView.getComputedStyle(exampleElement, null);
      } else {
        computed = exampleElement.currentStyle;
      }
      
      // set (lovely cssText property here helps a lot—if it works. Unfortunately, only Safari supplies it.)
      style = computed.cssText;
      
      // if that didn't work (Safari-only?) go alternate route. This is SLOW code...
      if (!style || style.trim() === "") {
        // there is only one way to do it...
        var props = this._copy_computed_props;
        
        // firefox ONLY allows this method
        for (var i = 0; i < props.length; i++) {
          var prop = props[i], val = computed[prop];
          element.style[prop] = val;
        }
        
        // and why does firefox specifically need "font" set?
        var cs = element.style; // cached style
        if (cs.font === "") {
          var font = "";
          if (cs.fontStyle) font += cs.fontStyle + " ";
          if (cs.fontVariant) font += cs.fontVariant + " ";
          if (cs.fontWeight) font += cs.fontWeight + " ";
          if (cs.fontSize) font += cs.fontSize; else font += "10px"; //force a default
          if (cs.lineHeight) font += "/" + cs.lineHeight;
          font += " ";
          if (cs.fontFamily) font += cs.fontFamily; else cs += "sans-serif";
          
          element.style.font = font;
        }
        
        SC.mixin(element.style, {
          left: "0px", top: "0px", position: "absolute", bottom: "auto", right: "auto", width: "auto", height: "auto"
        });
      }
      else
      {
        // set style
        element.setAttribute("style", style + "; position:absolute; left: 0px; top: 0px; bottom: auto; right: auto; width: auto; height: auto;");
      }
      
      // clean up
      computed = null;
    } else {
      // it is a style string already
      style = exampleElement;
      
      // set style
      element.setAttribute("style", style + "; position:absolute; left: 0px; top: 0px; bottom: auto; right: auto; width: auto; height: auto;");
    }
    
    // the conclusion of which to use (innerText or textContent) should be cached
    if (typeof element.innerText != "undefined") element.innerText = string;
    else element.textContent = string;
    
    element.className = classes;
    
    // measure
    var result = {
      width: element.clientWidth,
      height: element.clientHeight
    };
    
    // clear element
    element.innerHTML = "";
    element.className = "";
    element.setAttribute("style", ""); // get rid of any junk from computed style.
    
    // clean up
    element = null;
    return result;
  },

  /** Finds the absolute viewportOffset for a given element.
    This method is more accurate than the version provided by prototype.
    
    If you pass NULL to this method, it will return a { x:0, y:0 }
    @param el The DOM element
    @returns {Point} A hash with x,y offsets.
  */
  viewportOffset: function(el) {
    // Some browsers natively implement getBoundingClientRect, so if it's
    // available we'll use it for speed.
    if (el.getBoundingClientRect) {
      var boundingRect = el.getBoundingClientRect();
      return { x:boundingRect.left, y:boundingRect.top };
    }
    
    var valueL = 0 ; var valueT = 0;

    // add up all the offsets for the element.
    var element = el ;
    var isFirefox3 = SC.browser.mozilla >= 3 ;
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
      if (SC.browser.mozilla) {
        var overflow = SC.$(element).attr('overflow') ;
        if (overflow !== 'visible') {
          var left = parseInt(SC.$(element).attr('borderLeftWidth'),0) || 0 ;
          var top = parseInt(SC.$(element).attr('borderTopWidth'),0) || 0 ;
          if (el !== element) {
            left *= 2; top *= 2 ;
          }
          valueL += left; valueT += top ;
        }
        
        // In FireFox 3 -- the offsetTop/offsetLeft subtracts the clientTop/
        // clientLeft of the offset parent.
        var offsetParent = element.offsetParent ;
        if ((SC.browser.mozilla >= 3) && offsetParent) {
          valueT -= offsetParent.clientTop ;
          valueL -= offsetParent.clientLeft;
        }
      }

      // Safari fix
      if (element.offsetParent == document.body &&
        SC.$(element).attr('position') == 'absolute') break;

      element = element.offsetParent ;

    }

    element = el;
    while (element) {
      if (!SC.browser.isOpera || element.tagName == 'BODY') {
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
    return (value >= 0) && (value >= range.start) && (value < (range.start + range.length));  
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
  
  /** Returns the difference of the two ranges or SC.RANGE_NOT_FOUND */
  subtractRanges: function(r1, r2) {
    if ((r1 == null) || (r2 == null)) return SC.RANGE_NOT_FOUND ;
    if ((r1.length < 0) || (r2.length < 0)) return SC.RANGE_NOT_FOUND;
    var max = Math.max(SC.minRange(r1), SC.minRange(r2)) ;
    var min = Math.min(SC.maxRange(r1), SC.maxRange(r2)) ;
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
  },

  /** Returns hex color from hsv value */
  convertHsvToHex: function (h, s, v) {
    var r = 0;
    var g = 0;
    var b = 0;

    if (v > 0) {
      var i = (h == 1) ? 0 : Math.floor(h * 6);
      var f = (h == 1) ? 0 : (h * 6) - i;
      var p = v * (1 - s);
      var q = v * (1 - (s * f));
      var t = v * (1 - (s * (1 - f)));
      var rgb = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
      r = Math.round(255 * rgb[i][0]);
      g = Math.round(255 * rgb[i][1]);
      b = Math.round(255 * rgb[i][2]);
    }
    return this.parseColor('rgb(' + r + ',' + g + ',' + b + ')');
  },  

  /** Returns hsv color from hex value */
  convertHexToHsv: function (hex) {
    var rgb = this.expandColor(hex);
    var max = Math.max(Math.max(rgb[0], rgb[1]), rgb[2]);
    var min = Math.min(Math.min(rgb[0], rgb[1]), rgb[2]);

    var h = (max == min) ? 0 : ((max == rgb[0]) ? ((rgb[1]-rgb[2])/(max-min)/6) : ((max == rgb[1]) ? ((rgb[2]-rgb[0])/(max-min)/6+1/3) : ((rgb[0]-rgb[1])/(max-min)/6+2/3)));
    h = (h < 0) ? (h + 1) : ((h > 1)  ? (h - 1) : h);
    var s = (max == 0) ? 0 : (1 - min/max);
    var v = max/255;
    return [h, s, v];
  },

  /** regular expression for parsing color: rgb, hex */
  PARSE_COLOR_RGBRE: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i,
  PARSE_COLOR_HEXRE: /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,

  // return an array of r,g,b colour
  expandColor: function(color) {
    var hexColor, red, green, blue;
    hexColor = this.parseColor(color);
    if (hexColor) {
      red = parseInt(hexColor.slice(1, 3), 16);
      green = parseInt(hexColor.slice(3, 5), 16);
      blue = parseInt(hexColor.slice(5, 7), 16);
      return [red,green,blue];
    }
  },

  // parse rgb color or 3-digit hex color to return a properly formatted 6-digit hex colour spec, or false
  parseColor: function(string) {
    var i=0, color = '#', match;
    if(match = this.PARSE_COLOR_RGBRE.exec(string)) {
      var part;
      for (i=1; i<=3; i++) {
        part = Math.max(0, Math.min(255, parseInt(match[i],0)));
        color += this.toColorPart(part);
      }
      return color;
    }
    if (match = this.PARSE_COLOR_HEXRE.exec(string)) {
      if(match[1].length == 3) {
        for (i=0; i<3; i++) {
          color += match[1].charAt(i) + match[1].charAt(i);
        }
        return color;
      }
      return '#' + match[1];
    }
    return false;
  },

  // convert one r,g,b number to a 2 digit hex string
  toColorPart: function(number) {
    if (number > 255) number = 255;
    var digits = number.toString(16);
    if (number < 16) return '0' + digits;
    return digits;
  },
  
  
  // Get the computed style from specific element. Useful for cloning styles
  getStyle: function(oElm, strCssRule){
  	var strValue = "";
  	if(document.defaultView && document.defaultView.getComputedStyle){
  		strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
  	}
  	else if(oElm.currentStyle){
  		strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
  			return p1.toUpperCase();
  		});
  		strValue = oElm.currentStyle[strCssRule];
  	}
  	return strValue;
  }

}) ;
