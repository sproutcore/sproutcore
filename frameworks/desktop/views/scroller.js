// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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
    buttonLength: 41,
    thumbTopLength: 10,
    thumbBottomLength: 10
  });
}}}

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
    The value of the scroller.

    The value represents the position of the scroller's thumb.

    @property
  */
  value: function(key, val) {
    if (val !== undefined) {
      this._scs_value = val;
    }

    val = this._scs_value || 0 ; // default value is at top/left
    return Math.max(Math.min(val, this.get('maximum')), this.get('minimum')) ;
  }.property('maximum', 'minimum').cacheable(),

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    When set less than the height of the scroller, the scroller is disabled.

    @property {Number}
  */
  maximum: 0,

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
    YES if the maximum value exceeds the frame size of the scroller.  This
    will hide the thumb and buttons.

    @property
  */
  controlsHidden: function() {
    if (this.get('maximum') <= this.get('scrollerLength')) return YES;
    return NO;
  }.property('maximum', 'scrollerLength').cacheable(),

  /**
    Returns the owner view property the scroller should modify.  If this
    property is non-null and the owner view defines this property, then the
    scroller will automatically update this property whenever its own value
    changes.

    The default value of this property is computed based on the
    layoutDirection.  You can override this property to provide your own
    calculation if necessary or to return null if you want to disable this
    behavior.

    @property {String}
  */
  ownerScrollValueKey: function() {
    var key = null ;
    switch(this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        key = 'verticalScrollOffset' ;
        break ;
      case SC.LAYOUT_HORIZONTAL:
        key = 'horizontalScrollOffset' ;
        break ;
      default:
        key = null ;
    }
    return key ;
  }.property('layoutDirection').cacheable(),

  // ..........................................................
  // DISPLAY METRICS
  //

  /**
    The width or height of the scrollbar.

    @property {Number}
  */
  scrollbarThickness: 14,

  /**
    The width or height of the cap that encloses the track.

    @property {Number}
  */
  capLength: 18,

  /**
    The amount by which the scroller overlaps the cap.

    @property {Number}
  */
  capOverlap: 15,

  /**
    The amount by which the scroller overlaps the arrow buttons.

    @property {Number}
  */
  buttonOverlap: 8,

  /**
    The width or height of the up/down or left/right arrow buttons.

    @property {Number}
  */
  buttonLength: 40,

  /**
    The size of the top/left end of the thumb.

    @property {Number}
  */
  thumbTopLength: 10,


  /**
    The size of the bottom/right end of the thumb.

    @property {Number}
  */
  thumbBottomLength: 10,

  // ..........................................................
  // INTERNAL SUPPORT
  //

  displayProperties: 'maximum isEnabled value frame controlsHidden'.w(),

  /**
    Generates the HTML that gets displayed to the user.

    The first time render is called, the HTML will be output to the DOM.
    Successive calls will reposition the thumb based on the value property.

    @param {SC.RenderContext} context the render context
    @param {Boolean} firstTime YES if this is creating a layer
    @private
  */
  render: function(context, firstTime) {
    var classNames = [],
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'),
        value, thumbElement, max, scrollerLength, length, pct;

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

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      context.push('<div class="track"></div>',
                    '<div class="button-bottom"></div>',
                    '<div class="button-top"></div>',
                    '<div class="cap"></div>',
                    '<div class="thumb">',
                    '<div class="thumb-center"></div>',
                    '<div class="thumb-top"></div>',
                    '<div class="thumb-bottom"></div></div>');

      // default the thumb position to the top/left
      this._scs_thumbPosition = capLength - capOverlap;
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition the thumb
      value = this.get('value');

      // If the value hasn't changed then don't bother moving the thumb
      if (value === this._scs_scrollValue) return;
      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;
      // If we haven't calculated the thumb's size yet then we don't need to
      // reposition yet.
      if (!this._scs_thumbSize) return;

      thumbElement = this.$('.thumb');
      max = this.get('maximum');
      scrollerLength = this.get('scrollerLength');
      length = (this.get('trackLength') - this._scs_thumbSize);

      switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
          pct = (value / (max - scrollerLength));
          if (pct > 1) pct = 1;
          this._scs_thumbPosition = Math.ceil(pct * length + (capLength - capOverlap));
          thumbElement.css('top', this._scs_thumbPosition);
          break;
      case SC.LAYOUT_HORIZONTAL:
          pct = (value / (max - scrollerLength));
          if (pct > 1) pct = 1;
          this._scs_thumbPosition = Math.ceil(pct * length + (capLength - capOverlap));
          thumbElement.css('left', this._scs_thumbPosition);
          break;
      }

    }
  },

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

    return scrollerLength - this.capLength + this.capOverlap - this.buttonLength + this.buttonOverlap;
  }.property(),

  /**
    Handles mouse down events and adjusts the value property depending where
    the user clicked.

    If the control is disabled, we ignore all mouse input.

    If the user clicks the thumb, we note the position of the mouse event but
    do not take further action until they begin to drag.

    If the user clicks the track, we adjust the value a page at a time.

    If the user clicks the buttons, we adjust the value by a fixed amount.

    If the user clicks and holds on either the track or buttons, those actions
    are repeated until they release the mouse button.

    @param evt {SC.Event} the mousedown event
    @private
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO;

    var target = evt.target, value, clickLocation, clickOffset;

    // Determine the subcontrol that was clicked
    if (target.className.indexOf('thumb') >= 0) {
      // Convert the mouseDown coordinates to the view's coordinates
      clickLocation = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });

      clickLocation.x -= this._scs_thumbPosition;
      clickLocation.y -= this._scs_thumbPosition;

      // Store the starting state so we know how much to adjust the
      // thumb when the user drags
      this._thumbDragging = YES;
      this._thumbOffset = clickLocation;
      this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
      this._thumbPositionAtDragStart = this._scs_thumbPosition;
    } else if (target.className.indexOf('button-top') >= 0) {
      // User clicked the up/left button
      // Decrement the value by a fixed amount
      this.decrementProperty('value', 30);
      this.makeButtonActive('.button-top');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollUp');
    } else if (target.className.indexOf('button-bottom') >= 0) {
      // User clicked the down/right button
      // Increment the value by a fixed amount
      this.incrementProperty('value', 30);
      this.makeButtonActive('.button-bottom');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollDown');
    } else {
      // User clicked in the track
      var thumbPosition = this._scs_thumbPosition,
          scrollerLength = this.get('scrollerLength'),
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

      // Move the thumb up or down a page depending on whether the click
      // was above or below the thumb
      if (mousePosition < thumbPosition) {
        this.decrementProperty('value',scrollerLength);
        this.startMouseDownTimer('pageUp');
      } else {
        this.incrementProperty('value', scrollerLength);
        this.startMouseDownTimer('pageDown');
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

    return ret;
  },

  /**
    If the user began the drag on the thumb, we calculate the difference
    between the mouse position at click and where it is now.  We then
    offset the thumb by that amount, within the bounds of the track.

    @param evt {SC.Event} the mousedragged event
    @private
  */
  mouseDragged: function(evt) {
    var position, frame, length;

    // Only move the thumb if the user clicked on the thumb during mouseDown
    if (!this._thumbDragging) return NO;

    frame = this.get('frame');

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        position = this._thumbPositionAtDragStart + (evt.pageY - this._mouseDownLocation.y);
        length = frame.height;
        break;
      case SC.LAYOUT_HORIZONTAL:
        position = this._thumbPositionAtDragStart + (evt.pageX - this._mouseDownLocation.x);
        length = frame.width;
        break;
    }
    this._scs_thumbPosition = position = Math.max(0, position);

    this.set('value', Math.round((this._scs_thumbPosition / (this.get('trackLength')-this._scs_thumbSize)) * (this.get('maximum')-length)));
    return YES;
  },

  /**
    Starts a timer that fires after 300ms.  This is called when the user
    clicks a button or inside the track to move a page at a time. If they
    continue holding the mouse button down, we want to repeat that action
    after a small delay.  This timer will be invalidated in mouseUp.

    @private
  */
  startMouseDownTimer: function(action) {
    var timer;

    this._mouseDownTimerAction = action;
    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: 300
    });
  },

  /**
    Called by the mousedown timer.  This method determines the initial
    user action and repeats it until the timer is invalidated in mouseUp.

    @private
  */
  mouseDownTimerDidFire: function() {
    var scrollerLength = this.get('scrollerLength'),
        mouseLocation = this._mouseDownLocation,
        thumbPosition;

    switch (this._mouseDownTimerAction) {
      case 'scrollDown':
        this.incrementProperty('value', 30);
        break;
      case 'scrollUp':
        this.decrementProperty('value', 30);
        break;
      case 'pageDown':
        thumbPosition = this._scs_thumbPosition+this._scs_thumbSize;
        if (mouseLocation < thumbPosition) return;
        this.incrementProperty('value', scrollerLength);
        break;
      case 'pageUp':
        thumbPosition = this._scs_thumbPosition;
        if (mouseLocation > thumbPosition) return;
        this.decrementProperty('value', scrollerLength);
        break;
    }

    this._mouseDownTimer = SC.Timer.schedule({
      target: this, action: this.mouseDownTimerDidFire, interval: 50
    });
  },

  /**
    Returns the height of a vertical scroller or the width of a horizontal
    scroller.  This is used when scrolling up and down by page.

    @property {Number}
    @private
  */
  scrollerLength: function() {
    var elem = this.$()[0];
    if (!elem) return 0;
    console.log('clientHeight: '+elem.clientHeight);
    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        return elem.clientHeight;
        // return this.get('frame').height;
      case SC.LAYOUT_HORIZONTAL:
        return elem.clientWidth;
        // return this.get('frame').width;
    }

    return 0;
  }.property('frame').cacheable(),

  /**
    The size of the thumb ends.

    @private
  */
  thumbEndSizes: function() {
    return this.thumbTopLength + this.thumbBottomLength;
  }.property().cacheable(),

  /**
    Given a selector, finds the corresponding DOM element and adds
    the 'active' class name.  Also stores the returned element so that
    the 'active' class name can be removed during mouseup.

    @param {String} the selector to find
    @private
  */
  makeButtonActive: function(selector) {
    this._scs_buttonActive = this.$(selector).addClass('active');
  },

  /**
    Resizes the thumb when the scroller changes size or the maximum
    property changes.

    @private
  */
  _sc_scroller_frameDidChange: function() {
    var max = this.get('maximum'), length = this.get('trackLength'),
        size = this.get('scrollerLength'),
        thumb = this.$('.thumb'),
        thumbEndSizes = this.get('thumbEndSizes'),
        thumbCenter;

    if (this.get('controlsHidden')) {
      this.set('isEnabled', NO);
      return;
    }

    this.set('controlsHidden', NO);
    this.set('isEnabled', YES);
    if (thumb.length < 1) return;
    thumbCenter = thumb.children().first();

    switch (this.get('layoutDirection')) {
      case SC.LAYOUT_VERTICAL:
        length = this.get('trackLength');
        length = Math.ceil(Math.max((size/max)*length, 20));
        thumb.css('height', length);
        thumbCenter.css('height', Math.max(length-thumbEndSizes,0));
        break;
      case SC.LAYOUT_HORIZONTAL:
        length = this.get('trackLength');
        length = Math.ceil(Math.max((size/max)*length, 20));
        thumb.css('width', length);
        thumbCenter.css('width', Math.max(length-thumbEndSizes,0));
        break;
    }

    this._scs_thumbSize = length;
  }.observes('frame', 'maximum')
});
