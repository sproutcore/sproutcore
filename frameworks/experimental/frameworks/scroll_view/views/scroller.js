// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
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

      SC.mixin(SC.ScrollerView.prototype, {
        scrollbarThickness: 14,
        capLength: 18,
        capOverlap: 14,
        buttonOverlap: 11,
        buttonLength: 41
      });

  You can change whether scroll buttons are displayed by setting the
  hasButtons property.

  @extends SC.View
  @since SproutCore 1.0
 */
SC.ScrollerView = SC.View.extend(
  /** @scope SC.ScrollerView.prototype */{

  /**
    @type Array
    @default ['sc-scroller-view']
    @see SC.View#classNames
   */
  classNames: ['sc-scroller-view'],

  /**
    @type Array
    @default 'thumbPosition thumbLength isEnabled controlsHidden'.w()
    @see SC.View#displayProperties
   */
  displayProperties: ['thumbPosition', 'thumbLength', 'isEnabled', 'controlsHidden',
                      'layoutDirection', 'hasButtons',
                      'displayValue', 'controlsId', 'maximum', 'minimum'], // WAI-ARIA attrs

  /**
    The WAI-ARIA role for scroller view.

    @type String
    @default 'scrollbar'
    @readOnly
   */
  ariaRole: 'scrollbar',

  /**
    @type String
    @default 'scrollerRenderDelegate'
  */
  renderDelegateName: 'scrollerRenderDelegate',


  // ..........................................................
  // PROPERTIES
  //

  /**
    If YES, a click on the track will cause the scrollbar to scroll to that position.
    Otherwise, a click on the track will cause a page down.

    In either case, alt-clicks will perform the opposite behavior.

    @type Boolean
    @default NO
   */
  shouldScrollToClick: NO,

  /** @private
    The in-touch-scroll value.
   */
  _touchScrollValue: NO,

  controlsIdBinding: SC.Binding.oneWay('*parentView.contentView.layerId'),

  /**
    The value of the scroller.

    The value represents the position of the scroller's thumb.

    @field
    @type Number
    @observes maximum
    @observes minimum
   */
  value: function (key, val) {
    var minimum = this.get('minimum');
    if (val !== undefined) {
      this._scs_value = val;
    }

    val = this._scs_value || minimum; // default value is at top/left
    return Math.max(Math.min(val, this.get('maximum')), minimum) ;
  }.property('maximum', 'minimum').cacheable(),

  /**
    @type Number
    @observes value
   */
  displayValue: function () {
    return this.get("_touchScrollValue") ?
      this.get("_touchScrollValue") : this.get("value");
  }.property("value", "_touchScrollValue").cacheable(),

  /**
    The portion of the track that the thumb should fill. Usually the
    proportion will be the ratio of the size of the scroll view's content view
    to the size of the scroll view.

    Should be specified as a value between 0.0 (minimal size) and 1.0 (fills
    the slot). Note that if the proportion is 1.0 then the control will be
    disabled.

    @type Number
    @default 0.0
   */
  proportion: 0,

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    When set less than the height of the scroller, the scroller is disabled.

    @type Number
    @default 100
   */
  maximum: 100,

  /**
    The minimum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    @type Number
    @default 0
   */
  minimum: 0,

  /**
    YES to enable scrollbar, NO to disable it.  Scrollbars will automatically
    disable if the maximum scroll width does not exceed their capacity.

    @field
    @type Boolean
    @default YES
    @observes proportion
   */
  isEnabled: function (key, value) {
    if (value !== undefined) {
      this._scsv_isEnabled = value;
    }

    if (this._scsv_isEnabled !== undefined) {
      return this._scsv_isEnabled;
    }

    return this.get('proportion') < 1;
  }.property('proportion').cacheable(),

  /** @private */
  _scsv_isEnabled: undefined,

  /**
    Determine the layout direction.  Determines whether the scrollbar should
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect. Possible
    values:

      - SC.LAYOUT_VERTICAL
      - SC.LAYOUT_HORIZONTAL

    @type String
    @default SC.LAYOUT_VERTICAL
   */
  layoutDirection: SC.LAYOUT_VERTICAL,

  /**
    Whether or not the scroller should display scroll buttons

    @type Boolean
    @default YES
   */
  hasButtons: YES,


  // ..........................................................
  // DISPLAY METRICS
  //

  /**
    The width (if vertical scroller) or height (if horizontal scroller) of the
    scrollbar.

    @type Number
    @default 14
   */
  scrollbarThickness: 14,

  /**
    The width or height of the cap that encloses the track.

    @type Number
    @default 18
   */
  capLength: 18,

  /**
    The amount by which the thumb overlaps the cap.

    @type Number
    @default 14
   */
  capOverlap: 14,

  /**
    The width or height of the up/down or left/right arrow buttons. If the
    scroller is not displaying arrows, this is the width or height of the end
    cap.

    @type Number
    @defaut 41
   */
  buttonLength: 41,

  /**
    The amount by which the thumb overlaps the arrow buttons. If the scroller
    is not displaying arrows, this is the amount by which the thumb overlaps
    the end cap.

    @type Number
    @default 11
   */
  buttonOverlap: 11,

  /**
    The minimium length that the thumb will be, regardless of how much content
    is in the scroll view.

    @type Number
    @default 20
   */
  minimumThumbLength: 20,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  touchScrollDidStart: function (value) {
    this.set("_touchScrollValue", value);
  },

  /** @private */
  touchScrollDidEnd: function (value) {
    this.set("_touchScrollValue", NO);
  },

  /** @private */
  touchScrollDidChange: function (value) {
    this.set("_touchScrollValue", value);
  },

  // ..........................................................
  // SCROLLER DIMENSION COMPUTED PROPERTIES
  //

  /** @private
    Returns the total length of the track in which the thumb sits.

    The length of the track is the height or width of the scroller, less the
    cap length and the button length. This property is used to calculate the
    position of the thumb relative to the view.

    @property
   */
  trackLength: function () {
    return this.get('scrollerLength') -
      (this.capLength - this.capOverlap) -      // Subtract the size of the top/left cap
      (this.buttonLength - this.buttonOverlap); // Subtract the size of the scroll buttons,
                                                // or the end cap if they are not shown.
  }.property('scrollerLength').cacheable(),

  /** @private
    Returns the height of the view if this is a vertical scroller or the width
    of the view if this is a horizontal scroller. This is used when scrolling
    up and down by page, as well as in various layout calculations.

    @type Number
   */
  scrollerLength: function () {
    var length = 0;
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        length = this.get('frame').height;
        break;
      case SC.LAYOUT_HORIZONTAL:
        length = this.get('frame').width;
    }

    return length;
  }.property('frame').cacheable(),

  /** @private
    The total length of the thumb. The size of the thumb is the
    length of the track times the content proportion.

    @property
   */
  thumbLength: function () {
    var length = Math.floor(this.get('trackLength') * this.get('proportion'));
    length = isNaN(length) ? 0 : length;

    return Math.max(length, this.get('minimumThumbLength'));
  }.property('trackLength', 'proportion').cacheable(),

  /** @private
    The position of the thumb in the track.

    @type Number
    @isReadOnly
   */
  thumbPosition: function () {
    var value = this.get('displayValue'),
        max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), position;

    position = (value / max) * (trackLength - thumbLength);
    position += capLength - capOverlap; // account for the top / left cap

    return Math.floor(isNaN(position) ? 0 : position);
  }.property('displayValue', 'maximum', 'trackLength', 'thumbLength').cacheable(),

  /** @private
    YES if the maximum value exceeds the frame size of the scroller.  This
    will hide the thumb and buttons.

    @type Boolean
    @isReadOnly
   */
  controlsHidden: function () {
    return this.get('proportion') >= 1;
  }.property('proportion').cacheable(),


  // ..........................................................
  // MOUSE EVENTS
  //

  /** @private
    Returns the value for a position within the scroller's frame.
   */
  valueForPosition: function (pos) {
    var max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap');

    return ((pos - (capLength - capOverlap)) /
            (trackLength - thumbLength)) * max;
  },

  /** @private
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
   */
  mouseDown: function (evt) {
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


      // Move the thumb up or down a page depending on whether the click
      // was above or below the thumb
      } else if (mousePosition < thumbPosition) {
        this.decrementProperty('value', scrollerLength);
        this.startMouseDownTimer('page');
      } else {
        this.incrementProperty('value', scrollerLength);
        this.startMouseDownTimer('page');
      }
    }

    return YES;
  },

  /** @private
    When the user releases the mouse button, remove any active
    state from the button controls, and cancel any outstanding
    timers.

    @param evt {SC.Event} the mousedown event
   */
  mouseUp: function (evt) {
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

  /** @private
    If the user began the drag on the thumb, we calculate the difference
    between the mouse position at click and where it is now.  We then
    offset the thumb by that amount, within the bounds of the track.

    If the user began scrolling up/down using the buttons, this will track
    what component they are currently over, changing the scroll direction.

    @param evt {SC.Event} the mousedragged event
   */
  mouseDragged: function (evt) {
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
          if (evt.clientY < topButtonRect.bottom) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
        case SC.LAYOUT_HORIZONTAL:
          if (evt.clientX < topButtonRect.right) nowScrollingUp = YES;
          else nowScrollingDown = YES;
          break;
      }

      if ((nowScrollingUp || nowScrollingDown) && nowScrollingUp !== isScrollingUp) {
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

  /** @private
    Starts a timer that fires after 300ms.  This is called when the user
    clicks a button or inside the track to move a page at a time. If they
    continue holding the mouse button down, we want to repeat that action
    after a small delay.  This timer will be invalidated in mouseUp.

    Specify "immediate" as YES if it should not wait.
   */
  startMouseDownTimer: function (action, immediate) {
    var timer;

    this._mouseDownTimerAction = action;
    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: immediate ? 0 : 300
    });
  },

  /** @private
    Called by the mousedown timer.  This method determines the initial
    user action and repeats it until the timer is invalidated in mouseUp.
   */
  mouseDownTimerDidFire: function () {
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

  /** @private
    Given a selector, finds the corresponding DOM element and adds
    the 'active' class name.  Also stores the returned element so that
    the 'active' class name can be removed during mouseup.

    @param {String} the selector to find
   */
  makeButtonActive: function (selector) {
    this._scs_buttonActive = this.$(selector).addClass('active');
  }
});
