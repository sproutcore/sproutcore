// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Displays a horizontal or vertical scroller.  You will not usually need to
  work with scroller views directly, but you may override this class to
  implement your own custom scrollers.

  Because the scroller uses the dimensions of its constituent elements to
  calculate layout, you may need to override the default display metrics.

  You can either create a subclass of ScrollerView with the new values, or
  provide your own in your theme:

{{{
  SC.mixin(SC.ScrollerView.prototype, {
    scrollbarThickness: 14,
    capLength: 18,
    capOverlap: 14,
    buttonOverlap: 11,
    buttonLength: 41
  });
}}}

  You can change whether scroll buttons are displayed by setting the
  hasButtons property.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ScrollerView = SC.View.extend(
/** @scope SC.ScrollerView.prototype */ {

  classNames: ['sc-scroller-view'],

  // ..........................................................
  // PROPERTIES
  //
  
  /**
    If YES, a click on the track will cause the scrollbar to scroll to that position.
    Otherwise, a click on the track will cause a page down.
    
    In either case, alt-clicks will perform the opposite behavior.
  */
  shouldScrollToClick: NO,
  
  
  /**
    @private
    The in-touch-scroll value.
  */
  _touchScrollValue: NO,

  /**
    The value of the scroller.

    The value represents the position of the scroller's thumb.

    @property {Number}
  */
  value: function(key, val) {
    var minimum = this.get('minimum');
    if (val !== undefined) {
      this._scs_value = val;
    }

    val = this._scs_value || minimum; // default value is at top/left
    return Math.max(Math.min(val, this.get('maximum')), minimum) ;
  }.property('maximum', 'minimum').cacheable(),
  
  displayValue: function() {
    var ret;
    if (this.get("_touchScrollValue")) ret = this.get("_touchScrollValue");
    else ret = this.get("value");
    return ret;
  }.property("value", "_touchScrollValue").cacheable(),

  /**
    The portion of the track that the thumb should fill. Usually the
    proportion will be the ratio of the size of the scroll view's content view
    to the size of the scroll view.

    Should be specified as a value between 0.0 (minimal size) and 1.0 (fills
    the slot). Note that if the proportion is 1.0 then the control will be
    disabled.

    @property {Number}
  */
  proportion: 0,

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    When set less than the height of the scroller, the scroller is disabled.

    @property {Number}
  */
  maximum: 100,

  /**
    The minimum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    @property {Number}
  */
  minimum: 0,

  /**
    YES to enable scrollbar, NO to disable it.  Scrollbars will automatically
    disable if the maximum scroll width does not exceed their capacity.

    @property
  */
  isEnabled: YES,

  /**
    Determine the layout direction.  Determines whether the scrollbar should
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect.

    @property
  */
  layoutDirection: SC.LAYOUT_VERTICAL,

  /**
    Whether or not the scroller should display scroll buttons

    @property {Boolean}
    @default YES
  */
  hasButtons: YES,

  // ..........................................................
  // DISPLAY METRICS
  //

  /**
    The width (if vertical scroller) or height (if horizontal scroller) of the 
    scrollbar.

    @property {Number}
  */
  scrollbarThickness: 14,
  
  /**
    The width or height of the cap that encloses the track.

    @property {Number}
  */
  capLength: 18,

  /**
    The amount by which the thumb overlaps the cap.

    @property {Number}
  */
  capOverlap: 14,

  /**
    The width or height of the up/down or left/right arrow buttons. If the
    scroller is not displaying arrows, this is the width or height of the end
    cap.

    @property {Number}
  */
  buttonLength: 41,

  /**
    The amount by which the thumb overlaps the arrow buttons. If the scroller
    is not displaying arrows, this is the amount by which the thumb overlaps
    the end cap.

    @property {Number}
  */
  buttonOverlap: 11,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'thumbPosition thumbLength isEnabled controlsHidden'.w(),

  /**
    Generates the HTML that gets displayed to the user.

    The first time render is called, the HTML will be output to the DOM.
    Successive calls will reposition the thumb based on the value property.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @private
  */
  render: function(context, firstTime) {
    var classNames = {},
        buttons = '',
        thumbPosition, thumbLength, thumbCenterLength, thumbElement,
        value, max, scrollerLength, length, pct;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        classNames['sc-vertical'] = YES;
        break;
      case SC.LAYOUT_HORIZONTAL:
        classNames['sc-horizontal'] = YES;
        break;
    }

    // The appearance of the scroller changes if disabled
    classNames['disabled'] = !this.get('isEnabled');
    // Whether to hide the thumb and buttons
    classNames['controls-hidden'] = this.get('controlsHidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.setClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      if (this.get('hasButtons')) {
        buttons = '<div class="button-bottom"></div><div class="button-top"></div>';
      } else {
        buttons = '<div class="endcap"></div>';
      }

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb" style="height: '+thumbLength+'px; top: ' + thumbPosition + 'px;">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-bottom"></div></div>');
        break;
        case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb" style="width: '+thumbLength+'px; left: ' + thumbPosition + 'px;">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-bottom"></div></div>');
      }
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  },

  /**
  @private
  */
  touchScrollDidStart: function(value) {
    this.set("_touchScrollValue", value);
  },
  
  touchScrollDidEnd: function(value) {
    this.set("_touchScrollValue", NO);
  },
  
  touchScrollDidChange: function(value) {
    this.set("_touchScrollValue", value);
  },

  // ..........................................................
  // THUMB MANAGEMENT
  //
  /**
    Adjusts the thumb (for backwards-compatibility calls adjustThumbPosition+adjustThumbSize by default)
  */
  adjustThumb: function(thumb, position, length) {
    this.adjustThumbPosition(thumb, position);
    this.adjustThumbSize(thumb, length);
  },

  /**
    Updates the position of the thumb DOM element.

    @param {Number} position the position of the thumb in pixels
    @private
  */
  adjustThumbPosition: function(thumb, position) {
    // Don't touch the DOM if the position hasn't changed
    if (this._thumbPosition === position) return;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        thumb.css('top', position);
        break;
      case SC.LAYOUT_HORIZONTAL:
        thumb.css('left', position);
        break;
    }

    this._thumbPosition = position;
  },

  adjustThumbSize: function(thumb, size) {
    // Don't touch the DOM if the size hasn't changed
    if (this._thumbSize === size) return;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        thumb.css('height', Math.max(size, 20));
        break;
      case SC.LAYOUT_HORIZONTAL:
        thumb.css('width', Math.max(size,20));
        break;
    }

    this._thumbSize = size;
  },

  // ..........................................................
  // SCROLLER DIMENSION COMPUTED PROPERTIES
  //

  /**
    Returns the total length of the track in which the thumb sits.

    The length of the track is the height or width of the scroller, less the
    cap length and the button length. This property is used to calculate the
    position of the thumb relative to the view.

    @property
    @private
  */
  trackLength: function() {
    var scrollerLength = this.get('scrollerLength');

    // Subtract the size of the top/left cap
    scrollerLength -= this.capLength - this.capOverlap;
    // Subtract the size of the scroll buttons, or the end cap if they are
    // not shown.
    scrollerLength -= this.buttonLength - this.buttonOverlap;

    return scrollerLength;
  }.property('scrollerLength').cacheable(),

  /**
    Returns the height of the view if this is a vertical scroller or the width
    of the view if this is a horizontal scroller. This is used when scrolling
    up and down by page, as well as in various layout calculations.

    @property {Number}
    @private
  */
  scrollerLength: function() {
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        return this.get('frame').height;
      case SC.LAYOUT_HORIZONTAL:
        return this.get('frame').width;
    }

    return 0;
  }.property('frame').cacheable(),

  /**
    The total length of the thumb. The size of the thumb is the
    length of the track times the content proportion.

    @property
    @private
  */
  thumbLength: function() {
    var length;

    length = Math.floor(this.get('trackLength') * this.get('proportion'));
    length = isNaN(length) ? 0 : length;

    return Math.max(length,20);
  }.property('trackLength', 'proportion').cacheable(),

  /**
    The position of the thumb in the track.

    @property {Number}
    @isReadOnly
    @private
  */
  thumbPosition: function() {
    var value = this.get('displayValue'),
        max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), position;
        
    position = (value/max)*(trackLength-thumbLength);
    position += capLength - capOverlap; // account for the top/left cap

    return Math.floor(isNaN(position) ? 0 : position);
  }.property('displayValue', 'maximum', 'trackLength', 'thumbLength').cacheable(),

  /**
    YES if the maximum value exceeds the frame size of the scroller.  This
    will hide the thumb and buttons.

    @property {Boolean}
    @isReadOnly
    @private
  */
  controlsHidden: function() {
    return this.get('proportion') >= 1;
  }.property('proportion').cacheable(),

  // ..........................................................
  // MOUSE EVENTS
  //
  
  /**
    Returns the value for a position within the scroller's frame.
    
    @private
  */
  valueForPosition: function(pos) {
    var max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), value; 
    
    value = pos - (capLength - capOverlap);
    value = value / (trackLength - thumbLength);
    value = value * max;
    return value;
  },

  /**
    Handles mouse down events and adjusts the value property depending where
    the user clicked.

    If the control is disabled, we ignore all mouse input.

    If the user clicks the thumb, we note the position of the mouse event but
    do not take further action until they begin to drag.

    If the user clicks the track, we adjust the value a page at a time, unless
    alt is pressed, in which case we scroll to that position.

    If the user clicks the buttons, we adjust the value by a fixed amount, unless
    alt is pressed, in which case we adjust by a page.

    If the user clicks and holds on either the track or buttons, those actions
    are repeated until they release the mouse button.

    @param evt {SC.Event} the mousedown event
    @private
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO;
    
    // keep note of altIsDown for later.
    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;

    var target = evt.target,
        thumbPosition = this.get('thumbPosition'),
        value, clickLocation, clickOffset,
        scrollerLength = this.get('scrollerLength');
        
    // Determine the subcontrol that was clicked
    if (target.className.indexOf('thumb') >= 0) {
      // Convert the mouseDown coordinates to the view's coordinates
      clickLocation = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });

      clickLocation.x -= thumbPosition;
      clickLocation.y -= thumbPosition;

      // Store the starting state so we know how much to adjust the
      // thumb when the user drags
      this._thumbDragging = YES;
      this._thumbOffset = clickLocation;
      this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
      this._thumbPositionAtDragStart = this.get('thumbPosition');
      this._valueAtDragStart = this.get("value");
    } else if (target.className.indexOf('button-top') >= 0) {
      // User clicked the up/left button
      // Decrement the value by a fixed amount or page size
      this.decrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-top');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollUp');
      this._isScrollingUp = YES;
    } else if (target.className.indexOf('button-bottom') >= 0) {
      // User clicked the down/right button
      // Increment the value by a fixed amount
      this.incrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-bottom');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollDown');
      this._isScrollingDown = YES;
    } else {
      // User clicked in the track
      var scrollToClick = this.get("shouldScrollToClick");
      if (evt.altKey) scrollToClick = !scrollToClick;
      
      var trackLength = this.get('trackLength'),
          thumbLength = this.get('thumbLength'),
          frame = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY }),
          mousePosition;

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          this._mouseDownLocation = mousePosition = frame.y;
          break;
        case SC.LAYOUT_HORIZONTAL:
          this._mouseDownLocation = mousePosition = frame.x;
          break;
      }
      
      if (scrollToClick) {
        this.set('value', this.valueForPosition(mousePosition - (thumbLength / 2)));
        
        // and start a normal mouse down
        thumbPosition = this.get('thumbPosition');
        
        this._thumbDragging = YES;
        this._thumbOffset = {x: frame.x - thumbPosition, y: frame.y - thumbPosition };
        this._mouseDownLocation = {x:evt.pageX, y:evt.pageY};
        this._thumbPositionAtDragStart = thumbPosition;
        this._valueAtDragStart = this.get("value");
      } else {
        // Move the thumb up or down a page depending on whether the click
        // was above or below the thumb
        if (mousePosition < thumbPosition) {
          this.decrementProperty('value',scrollerLength);
          this.startMouseDownTimer('page');
        } else {
          this.incrementProperty('value', scrollerLength);
          this.startMouseDownTimer('page');
        }
      }
      
    }

    return YES;
  },

  /**
    When the user releases the mouse button, remove any active
    state from the button controls, and cancel any outstanding
    timers.

    @param evt {SC.Event} the mousedown event
    @private
  */
  mouseUp: function(evt) {
    var active = this._scs_buttonActive, ret = NO, timer;

    // If we have an element that was set as active in mouseDown,
    // remove its active state
    if (active) {
      active.removeClass('active');
      ret = YES;
    }

    // Stop firing repeating events after mouseup
    timer = this._mouseDownTimer;
    if (timer) {
      timer.invalidate();
      this._mouseDownTimer = null;
    }

    this._thumbDragging = NO;
    this._isScrollingDown = NO;
    this._isScrollingUp = NO;

    return ret;
  },

  /**
    If the user began the drag on the thumb, we calculate the difference
    between the mouse position at click and where it is now.  We then
    offset the thumb by that amount, within the bounds of the track.
    
    If the user began scrolling up/down using the buttons, this will track
    what component they are currently over, changing the scroll direction.

    @param evt {SC.Event} the mousedragged event
    @private
  */
  mouseDragged: function(evt) {
    var value, length, delta, thumbPosition,
        target = evt.target,
        thumbPositionAtDragStart = this._thumbPositionAtDragStart,
        isScrollingUp = this._isScrollingUp,
        isScrollingDown = this._isScrollingDown,
        active = this._scs_buttonActive,
        timer;

    // Only move the thumb if the user clicked on the thumb during mouseDown
    if (this._thumbDragging) {
      
      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          delta = (evt.pageY - this._mouseDownLocation.y);
          break;
        case SC.LAYOUT_HORIZONTAL:
          delta = (evt.pageX - this._mouseDownLocation.x);
          break;
      }
      
      // if we are in alt now, but were not before, update the old thumb position to the new one
      if (evt.altKey) {
        if (!this._altIsDown || (this._shiftIsDown !== evt.shiftKey)) {
          thumbPositionAtDragStart = this._thumbPositionAtDragStart = thumbPositionAtDragStart+delta;
          delta = 0;
          this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
          this._valueAtDragStart = this.get("value");
        }
        
        // because I feel like it. Probably almost no one will find this tiny, buried feature.
        // Too bad.
        if (evt.shiftKey) delta = -delta;
        
        this.set('value', Math.round(this._valueAtDragStart + delta * 2));
      } else {
        thumbPosition = thumbPositionAtDragStart + delta;
        length = this.get('trackLength') - this.get('thumbLength');
        this.set('value', Math.round( (thumbPosition/length) * this.get('maximum')));
      }
    
    } else if (isScrollingUp || isScrollingDown) {
      var nowScrollingUp = NO, nowScrollingDown = NO;
      
      var topButtonRect = this.$('.button-top')[0].getBoundingClientRect();
      var bottomButtonRect = this.$('.button-bottom')[0].getBoundingClientRect();
      
      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
          if (evt.pageY < topButtonRect.bottom) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
        case SC.LAYOUT_HORIZONTAL:
          if (evt.pageX < topButtonRect.right) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
      }
      
      if ((nowScrollingUp || nowScrollingDown) && nowScrollingUp !== isScrollingUp){
        //
        // STOP OLD
        //
        
        // If we have an element that was set as active in mouseDown,
        // remove its active state
        if (active) {
         active.removeClass('active');
        }

        // Stop firing repeating events after mouseup
        this._mouseDownTimerAction = nowScrollingUp ? "scrollUp" : "scrollDown";
        
        if (nowScrollingUp) {
          this.makeButtonActive('.button-top');
        } else if (nowScrollingDown) {
          this.makeButtonActive('.button-bottom');
        }
        
         this._isScrollingUp = nowScrollingUp;
         this._isScrollingDown = nowScrollingDown;
      }
    }
    
    
    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;
    return YES;
  },

  /**
    Starts a timer that fires after 300ms.  This is called when the user
    clicks a button or inside the track to move a page at a time. If they
    continue holding the mouse button down, we want to repeat that action
    after a small delay.  This timer will be invalidated in mouseUp.
    
    Specify "immediate" as YES if it should not wait.

    @private
  */
  startMouseDownTimer: function(action, immediate) {
    var timer;

    this._mouseDownTimerAction = action;
    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: immediate ? 0 : 300
    });
  },

  /**
    Called by the mousedown timer.  This method determines the initial
    user action and repeats it until the timer is invalidated in mouseUp.

    @private
  */
  mouseDownTimerDidFire: function() {
    var scrollerLength = this.get('scrollerLength'),
        mouseLocation = SC.device.get('mouseLocation'),
        thumbPosition = this.get('thumbPosition'),
        thumbLength = this.get('thumbLength'),
        timerInterval = 50;

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        mouseLocation = this.convertFrameFromView(mouseLocation).y;
        break;
      case SC.LAYOUT_HORIZONTAL:
        mouseLocation = this.convertFrameFromView(mouseLocation).x;
        break;
    }

    switch (this._mouseDownTimerAction) {
      case 'scrollDown':
        this.incrementProperty('value', this._altIsDown ? scrollerLength : 30);
        break;
      case 'scrollUp':
        this.decrementProperty('value', this._altIsDown ? scrollerLength : 30);
        break;
      case 'page':
        timerInterval = 150;
        if (mouseLocation < thumbPosition) {
          this.decrementProperty('value', scrollerLength);
        } else if (mouseLocation > thumbPosition+thumbLength) {
          this.incrementProperty('value', scrollerLength);
        }
    }

    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: timerInterval
    });
  },

  /**
    Given a selector, finds the corresponding DOM element and adds
    the 'active' class name.  Also stores the returned element so that
    the 'active' class name can be removed during mouseup.

    @param {String} the selector to find
    @private
  */
  makeButtonActive: function(selector) {
    this._scs_buttonActive = this.$(selector).addClass('active');
  }
});

// TO BE EVENTUALLY REPLACED W/RENDERERS FROM QUILMES
SC.TouchScrollerView = SC.ScrollerView.extend({
  classNames: ['sc-touch-scroller-view'],
  scrollbarThickness: 12,
  capLength: 5,
  capOverlap: 0,
  hasButtons: NO,
  buttonOverlap: 36,
  
  adjustThumb: function(thumb, position, length) {
    var thumbInner = this.$('.thumb-inner');
    var max = this.get("scrollerLength") - this.capLength, min = this.get("minimum") + this.capLength;
    
    if (position + length > max) {
      position = Math.min(max - 20, position);
      length = max - position;
    }
    
    if (position < min) {
      length -= min - position;
      position = min;
    }
    
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(0px,' + position + 'px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(0px,' + Math.round(length - 1044) + 'px,0px)');
        }
        break;
      case SC.LAYOUT_HORIZONTAL:
        if (this._thumbPosition !== position) thumb.css('-webkit-transform', 'translate3d(' + position + 'px,0px,0px)');
        if (this._thumbSize !== length) {
          thumbInner.css('-webkit-transform', 'translate3d(' + Math.round(length - 1044) + 'px,0px,0px)');
        }
        break;
    }

    this._thumbPosition = position;
    this._thumbSize = length;
  },
  
  render: function(context, firstTime) {
    var classNames = [],
        buttons = '',
        thumbPosition, thumbLength, thumbCenterLength, thumbElement,
        value, max, scrollerLength, length, pct;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        classNames.push('sc-vertical');
        break;
      case SC.LAYOUT_HORIZONTAL:
        classNames.push('sc-horizontal');
        break;
    }

    // The appearance of the scroller changes if disabled
    if (!this.get('isEnabled')) classNames.push('disabled');
    // Whether to hide the thumb and buttons
    if (this.get('controlsHidden')) classNames.push('controls-hidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.addClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      if (this.get('hasButtons')) {
        buttons = '<div class="button-bottom"></div><div class="button-top"></div>';
      } else {
        buttons = '<div class="endcap"></div>';
      }

      switch (this.get('layoutDirection')) {
        case SC.LAYOUT_VERTICAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateY('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
        break;
        case SC.LAYOUT_HORIZONTAL:
        context.push('<div class="track"></div>',
                      '<div class="cap"></div>',
                      buttons,
                      '<div class="thumb">',
                      '<div class="thumb-top"></div>',
                      '<div class="thumb-clip">',
                      '<div class="thumb-inner" style="-webkit-transform: translateX('+(thumbLength-1044)+'px);">',
                      '<div class="thumb-center"></div>',
                      '<div class="thumb-bottom"></div></div></div></div>');
      }
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  }
  
});
