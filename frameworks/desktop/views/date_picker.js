// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC */

/** @class

  A view for showing and selecting dates.

  For best results, use this view with layout: { width: 205, height: 224 }. (TODO: support
  flexible layouts.)

  @extends SC.View
  @since SproutCore 1.11
  @author Evin Grano
  @author Mike Ball
  @author Dave Porter
*/
SC.DatePickerView = SC.View.extend(SC.ActionSupport, {

  // Public

  /*
    The curently-selected date.

    @type SC.DateTime
    @default null
  */
  value: null,

  /*
    The first day (or a day within) the view's top-row week. Also used to determine which month
    should be styled as the current month.

    @type SC.DateTime
    @default {current month}
  */
  displayFromDate: SC.DateTime.create({ day: 1 }),

  /**
    Whether displayFromDate should update when the value moves to a different month.

    @type Boolean
    @default YES
  */
  updateDisplayOnChange: YES,

  /*
    Supports the firing of actions when the user changes the value on this control.

    @type String | SC.Object
    @default null
  */
  target: null,

  /*
    Supports the firing of actions when the user changes the value on this control.

    @type String | Function
    @default null
  */
  action: null,

  /*
    Override this property with an array of seven strings if you want to customize the day
    names used. Defaults to SC.DateTime's localized abbreviated day names.

    @type Array
    @default SC.DateTime.abbreviatedDayNames
  */
  weekdayStrings: null,

  /**
    Resets the view to the currently-selected date's month.

    @method
    @returns receiver
  */
  showSelectedDate: function() {
    var value = this.get('value');
    if (value) this.setIfChanged('displayFromDate', value.adjust({ day: 1 }));
    return this;
  },

  /**
    Selects today.
    
    @method
    @returns receiver
  */
  selectToday: function() {
    this._scdpv_setValue(this._scdpv_dateWithSelectedTime( SC.DateTime.create() ));
    return this;
  },

  /**
    Clears the selected date.

    @method
    @returns receiver
  */
  clearSelection: function() {
    this._scdpv_setValue(null);
    return this;
  },

  // Private.

  /** @private Sets the value if changed, and handles ancillary functions. */
  _scdpv_setValue: function(date) {
    var currentDate = this.get('date');
    if (date === currentDate) return; // nothing to do.
    this.set('value', date);
    this.fireAction();
  },

  /** @private Updates displayFromDate if updateDisplayOnChange. */
  _scdpv_valueDidChange: function() {
    if (this.get('updateDisplayOnChange')) this.showSelectedDate();
  }.observes('value'),

  /** @private
    Given the passed SC.DateTime, returns a SC.DateTime whose time portion matches the
    control's current value.
  */
  _scdpv_dateWithSelectedTime: function(date) {
    var val = this.get('value');
    if (!val) return date;
    return date.adjust({
      hour: val.get('hour'),
      minute: val.get('minute'),
      second: val.get('second'),
      millisecond: val.get('millisecond')
    });
  },

  // -------------------------
  // Keyboard support
  //

  /** @private */
  acceptsFirstResponder: function() {
    return this.get('isEnabledInPane');
  }.property('isEnabledInPane'),

  /** @private */
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt);
  },

  /** @private Left arrow moves date up by a day. */
  moveLeft: function(evt) {
    var value = this.get('value');
    if (value) {
      value = value.advance({ day: -1 });
      this._scdpv_setValue(value);
    }
    return YES;
  },
  /** @private Right arrow moves date down by a day. */
  moveRight: function(evt) {
    var value = this.get('value');
    if (value) {
      value = value.advance({ day: 1 });
      this._scdpv_setValue(value);
    }
    return YES;
  },
  /** @private Up arrow moves date up by a week. */
  moveUp: function(evt) {
    var value = this.get('value');
    if (value) {
      value = value.advance({ day: -7 });
      this._scdpv_setValue(value);
    }
    return YES;
  },
  /** @private Down arrow moves date down by a week. */
  moveDown: function(evt) {
    var value = this.get('value');
    if (value) {
      value = value.advance({ day: 7 });
      this._scdpv_setValue(value);
    }
    return YES;
  },

  /** @private Page up moves date up by a month. */
  pageUp: function() {
    var value = this.get('value');
    if (value) {
      value = value.advance({ month: -1 });
      this._scdpv_setValue(value);
    }
    return YES;
  },
  /** @private Page down moves date down by a month. */
  pageDown: function() {
    var value = this.get('value');
    if (value) {
      value = value.advance({ month: 1 });
      this._scdpv_setValue(value);
    }
    return YES;
  },

  /** @private If the user hits "enter" while dragging the date, lock it in. */
  insertNewline: function(evt) {
    if (this._isDraggingDate) {
      if (this.get('_beingSelectedDate')) this._scdpv_setValue(this.get('_beingSelectedDate'));
      this._isDraggingDate = NO;
      this.set('_beingSelectedDate', null);
      this._draggingDateDidEnd = YES;
      return YES;
    }
    else {
      return NO;
    }
  },
  /** @private If the user hits "cancel" while dragging the date, lock it down. */
  cancel: function(evt) {
    if (this._isDraggingDate) {
      this._isDraggingDate = NO;
      this.set('_beingSelectedDate', null);
      this._draggingDateDidEnd = YES;
      return YES;
    }
    else {
      return NO;
    }
  },

  // -------------------------
  // Mouse support
  //

  /** @private */
  touchDown: function(evt) { return this.mouseDown(evt) },
  /** @private */
  mouseDown: function(evt) {
    // Become first responder if appropriate.
    this.becomeFirstResponder();

    // Date stuff.
    var target = evt.target,
        dateIdentifier = target.id,
        date = this._scdpv_parseSelectedDate(evt.target.id);
    
    if (date) {
      this._isDraggingDate = YES;
      this.set('_beingSelectedDate', date);
      this._draggingDateDidEnd = NO;
      return YES;
    }

    // Button stuff.
    if (target.className.match('button')) { this.$(target).addClass('active'); }

    return YES;
  },

  mouseDragged: function(evt) {
    var target = evt.target,
        dateIdentifier = target.id,
        date = this._scdpv_parseSelectedDate(evt.target.id);
    
    if (this._isDraggingDate) {
      // If we got a date on mouseDown, and we have one now, update it.
      if (date) {
        this.set('_beingSelectedDate', date);
      }
      else {
        this.set('_beingSelectedDate', null);
      } 
      return YES;
    }

    return NO;
  },

  /** @private */
  touchUp: function(evt) { return this.mouseUp(evt) },
  /** @private */
  mouseUp: function(evt) {

    // Handle date stuff.
    if (!this._draggingDateDidEnd) {
      var date = this._scdpv_parseSelectedDate(evt.target.id);
      if (date) {
        this.set('_beingSelectedDate', null);
        this._scdpv_setValue(this._scdpv_dateWithSelectedTime(date));
      }
    }
    this._isDraggingDate = NO;
    this._draggingDateDidEnd = NO;

    // Handle button stuff.
    var displayFromDate = this.get('displayFromDate'),
        className = evt.target.className,
        param;

    if (className.match('button')) {
      var unit = className.match('previous') ? -1 : 1;

      if (className.match('year')) {
        param = {year: unit};
      } else {
        param = {month: unit};
      }

      this.set('displayFromDate', displayFromDate.advance(param));
      this.$('.button.active').removeClass('active');
      return YES;
    } else {
      return NO;
    }
  },

  // -------------------------
  // Rendering
  //

  /** @private */
  classNames: ['sc-date-picker'],

  /** @private */
  displayProperties: ['displayFromDate', 'value', '_beingSelectedDate'],

  /** @private
    NOTE: This is some old janky rendering. If you have improved it, please submit a pull request!
    TODO: - Redo the rendering & CSS to enable more than just one width and height!
          - Add render/update for more efficient updating
  */
  render: function(context, firstTime) {
    var displayFromDate = this.get('displayFromDate'),
        startDay = displayFromDate.get('dayOfWeek'),
        currDate = displayFromDate.advance({day: -startDay}),
        selDate = this.get('value'),
        mouseDownDate = this.get('_beingSelectedDate'),
        todaysDate = SC.DateTime.create(),
        weekdayStrings = this.get('weekdayStrings') || SC.DateTime.abbreviatedDayNames,
        classNames, uniqueDayIdentifier, isCurrentMonth, isActiveDate, isToday;

    // Render header
    context = context.begin().addClass('header')
      context.begin().addClass('month').text(displayFromDate.toFormattedString('%B %Y')).end()
      context.begin().addClass('button previous').end()
      context.begin().addClass('button next').end();
    context = context.end()

    // Render body
    context = context.begin('div').addClass('body');

    for (var i = 0; i < 7; i++) {
      context.begin('div').addClass('day name').text(weekdayStrings[i]).end();
    }

    context = context.begin().addClass('grid');

    for (var gIdx = 0; gIdx < 42; gIdx++) {
      uniqueDayIdentifier = this._scdpv_createUniqueDayIdentifier(currDate);

      classNames = ['day'];

      // Present month
      if (currDate.get('month') === displayFromDate.get('month')) classNames.push('present');
      // Past month
      else if (SC.DateTime.compareDate(currDate, displayFromDate) < 0) classNames.push('past');
      // Future month
      else classNames.push('future');

      isToday = currDate.get('day') === todaysDate.get('day') && currDate.get('month') === todaysDate.get('month') && currDate.get('year') === todaysDate.get('year');
      isSelectedDate = selDate && currDate.get('day') === selDate.get('day') && currDate.get('month') === selDate.get('month') && currDate.get('year') === selDate.get('year');
      isBeingSelectedDate = mouseDownDate && currDate.get('day') === mouseDownDate.get('day') && currDate.get('month') === mouseDownDate.get('month') && currDate.get('year') === mouseDownDate.get('year');

      if (isToday) classNames.push('today');
      if (isSelectedDate) classNames.push('sel');
      if (isBeingSelectedDate) classNames.push('active');

      context.begin()
             .setAttr('id', uniqueDayIdentifier)
             .addClass(classNames)
             .text(currDate.get('day'))
             .end();

      currDate = currDate.advance({ day: 1 });
    }

    context = context.end().end();
  },

  /** @private */
  _scdpv_createUniqueDayIdentifier: function(currDate) {
    var day = currDate.get('day');
    var month = currDate.get('month');
    var year = currDate.get('year');
    return 'scdate-%@-%@-%@-%@'.fmt(this.get('layerId'), day, month, year);
  },

  /** @private */
  _scdpv_parseSelectedDate: function(dateIdentifier) {
    if (!SC.empty(dateIdentifier)) {
      var dataArray = dateIdentifier.split('-');
      if (dataArray.length === 5 && dataArray[0] === 'scdate' && dataArray[1] === this.get('layerId')) {
        var day = dataArray[2];
        var month = dataArray[3];
        var year = dataArray[4];
        return SC.DateTime.create({ day: day, month: month, year: year });
      }
    }
    return null;
  }

});
