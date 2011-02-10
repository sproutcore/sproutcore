// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// These are helpful utility functions for calculating range and rect values
sc_require('system/browser');

SC.mixin( /** @scope SC */ {

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

  /** Return true if the number is between 0 and 1 */
  isPercentage: function(val){
    return (val<1 && val>0);
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
      var boundingRect = el.getBoundingClientRect(),
          isIOS41 = false;
      // we need to detect the mobileSafari build number in the userAgent.
      // The webkit versions are the same but the results returned by getBoundingClientRect
      // are very different one includes the scrolling from the top of the document , the other
      // doesnt
      if (SC.browser.mobileSafari){
        var userAgent = navigator.userAgent,
            index = userAgent.indexOf('Mobile/'),
            mobileBuildNumber = userAgent.substring(index+7, index+9);
        if (mobileBuildNumber > "8A") isIOS41 = true;

      }

      if (SC.browser.mobileSafari && (parseInt(SC.browser.mobileSafari, 0)>532 || isIOS41)) {
        return { x:boundingRect.left+(window.pageXOffset || 0), y:boundingRect.top+(window.pageYOffset || 0) };
      }
      else{
        return { x:boundingRect.left, y:boundingRect.top };
      }
    }

    var valueL = 0, valueT = 0, cqElement, overflow, left, top, offsetParent,
        element = el, isFirefox3 = SC.browser.mozilla >= 3 ;
    // add up all the offsets for the element.

    while (element) {
      cqElement = SC.$(element);
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
        overflow = cqElement.attr('overflow') ;
        if (overflow !== 'visible') {
          left = parseInt(cqElement.attr('borderLeftWidth'),0) || 0 ;
          top = parseInt(cqElement.attr('borderTopWidth'),0) || 0 ;
          if (el !== element) {
            left *= 2; top *= 2 ;
          }
          valueL += left; valueT += top ;
        }

        // In FireFox 3 -- the offsetTop/offsetLeft subtracts the clientTop/
        // clientLeft of the offset parent.
        offsetParent = element.offsetParent ;
        if (SC.browser.mozilla.match(/1[.]9/) && offsetParent) {
          valueT -= offsetParent.clientTop ;
          valueL -= offsetParent.clientLeft;
        }
      }

      // Safari fix
      if (element.offsetParent == document.body &&
        cqElement.attr('position') === 'absolute') break;

      element = element.offsetParent ;

    }

    element = el;
    while (element) {
      if (!SC.browser.isOpera || element.tagName === 'BODY') {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }

      element = element.parentNode ;
    }

    return { x: valueL, y: valueT } ;
  }

}) ;
