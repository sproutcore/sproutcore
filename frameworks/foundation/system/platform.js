// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  This platform object allows you to conditionally support certain HTML5
  features.

  Rather than relying on the user agent, it detects whether the given elements
  and events are supported by the browser, allowing you to create much more
  robust apps.
*/
SC.platform = {
  /**
    YES if the current device supports touch events, NO otherwise.

    You can simulate touch events in environments that don't support them by
    calling SC.platform.simulateTouchEvents() from your browser's console.

    @property {Boolean}
  */
  touch: ('createTouch' in document),
  
  bounceOnScroll: (/iPhone|iPad|iPod/).test(navigator.platform),
  pinchToZoom: (/iPhone|iPad|iPod/).test(navigator.platform),

  input: {
    placeholder: (function() { return 'placeholder' in document.createElement('input'); })()
  },

  /**
    A hash that contains properties that indicate support for new HTML5
    input attributes.

    For example, to test to see if the placeholder attribute is supported,
    you would verify that SC.platform.input.placeholder is YES.
  */
  input: function(attributes) {
    var ret = {},
        len = attributes.length,
        elem = document.createElement('input'),
        attr, idx;

    for (idx=0; idx < len; idx++) {
      attr = attributes[idx];

      ret[attr] = !!(attr in elem);
    }

    return ret;
  }(('autocomplete readonly list size required multiple maxlength '
    +'pattern min max step placeholder').w()),

  /**
    YES if the application is currently running as a standalone application.

    For example, if the user has saved your web application to their home
    screen on an iPhone OS-based device, this property will be true.
    @property {Boolean}
  */
  standalone: navigator.standalone,

  /**
    Prefix for browser specific CSS attributes. Calculated later.
  */
  cssPrefix: null,

  /**
    Prefix for browsew specific CSS attributes when used in the DOM. Calculated later.
  */
  domCSSPrefix: null,

  /**
    Call this method to swap out the default mouse handlers with proxy methods
    that will translate mouse events to touch events.

    This is useful if you are debugging touch functionality on the desktop.
  */
  simulateTouchEvents: function() {
    // Touch events are supported natively, no need for this.
    if (this.touch) {
      //@ if (debug)
      SC.Logger.info("Can't simulate touch events in an environment that supports them.");
      //@ endif
      return;
    }

    // Tell the app that we now "speak" touch
    SC.platform.touch = YES;

    // CSS selectors may depend on the touch class name being present
    document.body.className = document.body.className + ' touch';

    // Initialize a counter, which we will use to generate unique ids for each
    // fake touch.
    this._simtouch_counter = 1;

    // Remove events that don't exist in touch environments
    this.removeEvents('click dblclick mouseout mouseover mousewheel'.w());

    // Replace mouse events with our translation methods
    this.replaceEvent('mousemove', this._simtouch_mousemove);
    this.replaceEvent('mousedown', this._simtouch_mousedown);
    this.replaceEvent('mouseup', this._simtouch_mouseup);
  },

  /** @private
    Removes event listeners from the document.

    @param {Array} events Array of strings representing the events to remove
  */
  removeEvents: function(events) {
    var idx, len = events.length, key;
    for (idx = 0; idx < len; idx++) {
      key = events[idx];
      SC.Event.remove(document, key, SC.RootResponder.responder, SC.RootResponder.responder[key]);
    }
  },

  /** @private
    Replaces an event listener with another.

    @param {String} evt The event to replace
    @param {Function} replacement The method that should be called instead
  */
  replaceEvent: function(evt, replacement) {
    SC.Event.remove(document, evt, SC.RootResponder.responder, SC.RootResponder.responder[evt]);
    SC.Event.add(document, evt, this, replacement);
  },

  /** @private
    When simulating touch events, this method is called when mousemove events
    are received.
  */
  _simtouch_mousemove: function(evt) {
    if (!this._mousedown) return NO;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchmove');
    return SC.RootResponder.responder.touchmove(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mousedown events
    are received.
  */
  _simtouch_mousedown: function(evt) {
    this._mousedown = YES;

    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchstart');
    return SC.RootResponder.responder.touchstart(manufacturedEvt);
  },

  /** @private
    When simulating touch events, this method is called when mouseup events
    are received.
  */
  _simtouch_mouseup: function(evt) {
    var manufacturedEvt = this.manufactureTouchEvent(evt, 'touchend'),
        ret = SC.RootResponder.responder.touchend(manufacturedEvt);

    this._mousedown = NO;
    this._simtouch_counter++;
    return ret;
  },

  /** @private
    Converts a mouse-style event to a touch-style event.

    Note that this method edits the passed event in place, and returns
    that same instance instead of a new, modified version.

    @param {Event} evt the mouse event to modify
    @param {String} type the type of event (e.g., touchstart)
    @returns {Event} the mouse event with an added changedTouches array
  */
  manufactureTouchEvent: function(evt, type) {
    var touch, touchIdentifier = this._simtouch_counter;

    touch = {
      type: type,
      target: evt.target,
      identifier: touchIdentifier,
      pageX: evt.pageX,
      pageY: evt.pageY,
      screenX: evt.screenX,
      screenY: evt.screenY,
      clientX: evt.clientX,
      clientY: evt.clientY
    };

    evt.changedTouches = evt.touches = [ touch ];
    return evt;
  },

  /**
    Whether the browser supports CSS transitions. Calculated later.
  */
  supportsCSSTransitions: NO,

  /**
    Whether the browser supports 2D CSS transforms. Calculated later.
  */
  supportsCSSTransforms: NO,

  /**
    Whether the browser understands 3D CSS transforms.
    This does not guarantee that the browser properly handles them.
    Calculated later.
  */
  understandsCSS3DTransforms: NO,

  /**
    Whether the browser can properly handle 3D CSS transforms. Calculated later.
  */
  supportsCSS3DTransforms: NO,
  
  /**
    Whether the browser can handle accelerated layers. While supports3DTransforms tells us if they will
    work in principle, sometimes accelerated layers interfere with things like getBoundingClientRect.
    Then everything breaks.
  */
  supportsAcceleratedLayers: NO,
  
  /**
    Wether the browser supports the hashchange event.
  */
  supportsHashChange: function() {
    // Code copied from Modernizr which copied code from YUI (MIT licenses)
    // documentMode logic from YUI to filter out IE8 Compat Mode which false positives
    return ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode > 7);
  }(),
  
  supportsWebSQLDatabase: function() {
    return ('openDatabase' in window);
  }
};

/* Calculate CSS Prefixes */

(function(){
  var userAgent = navigator.userAgent.toLowerCase();
  if ((/webkit/).test(userAgent)) {
    SC.platform.cssPrefix = 'webkit';
    SC.platform.domCSSPrefix = 'Webkit';
  } else if((/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'opera';
    SC.platform.domCSSPrefix = 'O';
  } else if((/msie/).test( userAgent ) && !(/opera/).test( userAgent )) {
    SC.platform.cssPrefix = 'ms';
    SC.platform.domCSSPrefix = 'ms';
  } else if((/mozilla/).test( userAgent ) && !(/(compatible|webkit)/).test( userAgent )) {
    SC.platform.cssPrefix = 'moz';
    SC.platform.domCSSPrefix = 'Moz';
  }
})();

/* Calculate transform support */

(function(){
  // a test element
  var el = document.createElement("div");

  // the css and javascript to test
  var css_browsers = ["-moz-", "-moz-", "-o-", "-ms-", "-webkit-"];
  var test_browsers = ["moz", "Moz", "o", "ms", "webkit"];

  // prepare css
  var css = "", i = null;
  for (i = 0; i < css_browsers.length; i++) {
    css += css_browsers[i] + "transition:all 1s linear;";
    css += css_browsers[i] + "transform: translate(1px, 1px);";
    css += css_browsers[i] + "perspective: 500px;";
  }

  // set css text
  el.style.cssText = css;

  // test
  for (i = 0; i < test_browsers.length; i++)
  {
    if (el.style[test_browsers[i] + "TransitionProperty"] !== undefined) SC.platform.supportsCSSTransitions = YES;
    if (el.style[test_browsers[i] + "Transform"] !== undefined) SC.platform.supportsCSSTransforms = YES;
    if (el.style[test_browsers[i] + "Perspective"] !== undefined || el.style[test_browsers[i] + "PerspectiveProperty"] !== undefined) {
      SC.platform.understandsCSS3DTransforms = YES;
      SC.platform.supportsCSS3DTransforms = YES;
    }
  }

  // unfortunately, we need a bit more to know FOR SURE that 3D is allowed
  if (window.media && window.media.matchMedium) {
    if (!window.media.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;
  } else if(window.styleMedia && window.styleMedia.matchMedium) {
    if (!window.styleMedia.matchMedium('(-webkit-transform-3d)')) SC.platform.supportsCSS3DTransforms = NO;    
  }
  
  // Unfortunately, this has to be manual, as I can't think of a good way to test it
  // webkit-only for now.
  if (SC.platform.supportsCSSTransforms && SC.platform.cssPrefix === "webkit") {
    SC.platform.supportsAcceleratedLayers = YES;
  }
})();
