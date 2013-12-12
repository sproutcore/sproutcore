// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals SC */

sc_require('views/date_picker');

/** @class

  A text field for editing a date and time.

  Set `useDatePicker` to `YES` to show a date picker when the user selects the date. You can
  also control the date picker directly by setting `datePickerIsShowing`. (You can control
  the date picker's behavior further with `dismissPickerOnChange` and `updateOnPickerChange`.)

  By default, only the date is visible; you can control this with `showDate` and `showTime`.
  If only the date is showing, customize its format with `dateFormat`. If only the time is
  showing, use `timeFormat`, and if both are showing then use `dateTimeFormat`.

  ```
  dateAndTime: SC.DateFieldView.design({
    showTime: YES,
    valueBinding: '...'
  }),
  timeOnly: SC.DateFieldView.design({
    showTime: YES,
    showDate: NO,
    valueBinding: '...'
  }),
  formattedDate: SC.DateFieldView.design({
    formatDate: '%d %b of %Y',
    valueBinding: '...'
  })
  ```

  For display purposes, only fixed-width formats are suppored; for example, months must be
  displayed as 01 - 12 rather than 1 - 12. The following fixed-width format keys are supported:

      - `%a` -- The abbreviated weekday name ("Sun")
      - `%b` -- The abbreviated month name ("Jan")
      - `%d` -- Day of the month (01..31)
      - `%H` -- Hour of the day, 24-hour clock (00..23)
      - `%I` -- Hour of the day, 12-hour clock (01..12)
      - `%j` -- Day of the year (001..366)
      - `%m` -- Month of the year (01..12)
      - `%M` -- Minute of the hour (00..59)
      - `%p` -- Meridian indicator ("AM" or "PM")
      - `%s` -- Milliseconds of the second (000..999)
      - `%U` -- Week number of the current year,
          starting with the first Sunday as the first
          day of the first week (00..53)
      - `%W` -- Week number of the current year,
          starting with the first Monday as the first
          day of the first week (00..53)
      - `%y` -- Year without a century (00..99)
      - `%Y` -- Year with century

  @extends SC.TextFieldView
  @since SproutCore 1.0
  @author Juan Pablo Goldfinger
  @author Dave Porter
*/
SC.DateFieldView = SC.TextFieldView.extend(
/** @scope SC.DateFieldView.prototype */ {

  /** Public */

  /**
    @type String
    @default null
  */
  value: null,

  /**
    @type Boolean
    @default YES
  */
  showDate: YES,

  /**
    @type Boolean
    @default NO
  */
  showTime: NO,

  /**
    The format used for showing only the time. Used when showDate is NO and showTime is YES.

    @type String
    @default '%I:%M %p'
  */
  formatTime: '%I:%M %p',

  /**
    The format used for showing only the date. Used when showDate is YES and showTime is NO.

    @type String
    @default '%d/%m/%Y'
  */
  formatDate: '%d/%m/%Y',

  /**
    The format used for showing both date and time. Used when showDate and showTime are both YES.

    @type String
    @default '%d/%m/%Y %I:%M %p'
  */
  formatDateTime: '%d/%m/%Y %I:%M %p',

  /**
    Whether or not the view uses a date picker for picking dates. If set to YES, then a date
    picker will be automatically shown when the view is focused and a date section is active.

    @type Boolean
    @default NO
  */
  useDatePicker: NO,

  /**
    If set to YES, the date picker will be dismissed as soon as the user picks a date. (Note
    that the date will )

    @type Boolean
    @default NO
  */
  dismissPickerOnChange: NO,

  /**
    If set to YES, changes to the picker's value will be immediately reflected in this control.
    If set to NO (the default), then the value will be updated when the picker is dismissed,
    unless the user cancels the picker by pressing the escape key.

    @type Boolean
    @default NO
  */
  updateOnPickerChange: NO,

  /*
    The date picker to be used if showDatePicker is YES. By default, this is a PickerPane with
    SC.DatePickerView. Override to provide your own date picker. The picker's value property
    will be bound to this view's value property. You should specify a class; it will be instantiated
    as needed.

    The default implementations of appendDatePicker and removeDatePicker require that datePicker
    implement `popup` and `remove` (as does the default SC.PickerPane). If you override datePicker to
    something other than a PickerPane, either make sure that it implements `popup` and `remove`, or
    override appendDatePicker and removeDatePicker.

    @type SC.Pane
    @default SC.PickerPane with SC.DatePickerView
  */
  datePicker: SC.PickerPane.extend({
    value: null,
    layout: { width: 205, height: 224 },
    preferType: SC.PICKER_POINTER,
    preferMatrix: [3, 2, 0, 1, 3],
    // Slight hack here to enable arrow-key proxying.
    defaultResponder: function() { return this.get('contentView'); }.property().cacheable(),
    contentView: SC.DatePickerView.extend({
      valueBinding: '.parentView.value'
    })
  }),

  /*
    Whether the date picker is currently showing. Set this to append or remove the date picker.
    Setting this value will be unsuccessful if the view refuses to append or remove the picker
    (via `appendDatePicker` and `removeDatePicker`).

    @type {Boolean}
  */
  datePickerIsShowing: function(key, value) {
    // Getter.
    if (value === undefined) return NO; // initial value; should be permanently cached until set.
    // Setter. (If the view fails to successfully executes the change, tryToPerform returns NO.)
    if (value) {
      this.setIfChanged('_datePickerValue', this.get('value'));
      this._scdfv_instantiateDatePicker();
      return !(this.tryToPerform('appendDatePicker') === NO);
    }
    else return !!(this.tryToPerform('removeDatePicker') === NO);
  }.property().cacheable(),

  /*
    Called by this view to append the date picker to the application as needed. You should not
    call this method directly; instead, set datePickerIsShowing.

    If you specify a datePicker which does not support the `popup` method, then you should
    override this method to correctly append your date picker. Be sure to return YES if the
    picker is or becomes attached, and NO if the picker fails to become attached.

    If you override this method, you will probably need to override `removeDatePicker` as well.

    @method
  */  
  appendDatePicker: function() {
    // If no datePicker instance, datePicker doesn't expose `popup` method, or datePicker is
    // explicitly not appended, there's nothing to do.
    if (!this.datePicker || this.datePicker.isClass) return NO;
    if (!this.datePicker.popup) return NO;
    var isAppended = this.datePicker.get('isAttached');
    if (isAppended & SC.View.IS_ATTACHED) return YES;
    // Do the business.
    this.datePicker.popup(this);
    return YES;
  },

  /*
    Called by this view to remove the date picker to the application as needed. You should not
    call this method directly; instead, set datePickerIsShowing.

    If you specify a datePicker which does not support the `remove` method, then you should
    override this method to correctly remove your date picker. Be sure to return YES if the
    picker is or becomes removed, and NO if the picker fails to become removed.

    If you override this method, you will probably need to override `appendDatePicker` as well.

    @method
    @returns {Boolean} success
  */  
  removeDatePicker: function() {
    // If no datePicker instance, datePicker doesn't expose `remove` method, or datePicker is
    // explicitly appended, there's nothing to do.
    if (!this.datePicker || this.datePicker.isClass) return NO;
    if (!this.datePicker.remove) return NO;
    var isAppended = this.datePicker.get('isAttached');
    if (!(isAppended & SC.View.IS_ATTACHED)) return YES;
    // Do the business.
    this.datePicker.remove();
    return YES;
  },


  /** Private */

  // DateTime constants (with fixed width, like numbers or abbs with fixed length)
  // original: '%a %A %b %B %c %d %h %H %i %I %j %m %M %p %S %U %W %x %X %y %Y %Z %%'.w(),

  /** @private The supported date format keys. */
  _dtConstants: ['%a', '%b', '%d', '%H', '%I', '%j', '%m', '%M', '%p', '%S', '%U', '%W', '%y', '%Y'],

  /** @private The width of each date format key. Match to _dtConstants. */
  _wtConstants: [3, 3, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 4],

  /** @private Whether each format key is part of the date (as opposed to time). Match to _dtConstants. */
  _isDateConstants: [YES, YES, YES, NO, NO, YES, YES, NO, NO, NO, YES, YES, YES, YES],

  /** @private */
  activeSelection: 0,

  /**
    The date format. Usually this will be chosen automatically based on the date and
    time formats that you specify.

    @readonly
    @field
    @type String
    @observes showTime
    @observes showDate
  */
  format: function() {
    var st = this.get('showTime');
    var sd = this.get('showDate');
    if (st === YES && sd === YES) return this.get('formatDateTime');
    if (st === YES) return this.get('formatTime');
    return this.get('formatDate');
  }.property('showTime', 'showDate', 'formatDate', 'formatTime', 'formatDateTime').cacheable(),

  /**
    Validates the entered text against the view's current date format.

    @field
    @type SC.Validator.DateTime
    @observes format
  */
  validator: function() {
    return SC.Validator.DateTime.extend({ format: this.get('format') });
  }.property('format').cacheable(),

  /** @private
    Array of Key/TextSelection found for the current format.

    @field
    @type SC.Array
  */
  tabsSelections: function() {
    var arr = [],
        ft = this.get('format'),
        _dt = this._dtConstants,
        _wt = this._wtConstants,
        _isDate = this._isDateConstants;

    // Parse the string format to retrieve and build
    // a TextSelection array ordered to support tabs behaviour
    if (SC.empty(ft)) {
      throw new Error('The format string is empty, and must be a valid string.');
    }

    var pPos, key, keyPos, startAt = 0, nPos = 0, oPos = 0;
    while(startAt < ft.length && ft.indexOf('%', startAt) !== -1) {
      pPos = ft.indexOf('%', startAt);
      key = ft.substring(pPos, pPos + 2);
      startAt = pPos + 2;

      keyPos = _dt.indexOf(key);
      if (keyPos === -1) {
        throw new Error("SC.DateFieldView: The format's key '%@' is not supported.".fmt(key));
      }
      nPos = nPos + pPos - oPos;
      arr.push(SC.Object.create({
        key: key,
        isDate: _isDate[keyPos],
        textSelection: SC.TextSelection.create({ start: nPos, end: nPos + _wt[keyPos] })
      }));
      nPos = nPos + _wt[keyPos];
      oPos = startAt;
    }
    pPos = key = keyPos = null;

    return arr;
  }.property('format').cacheable(),

  /** @private
    If the activeSelection changes or the value changes, update the "TextSelection" to show accordingly.
  */
  updateTextSelectionObserver: function() {
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    if (this.get('isEditing')) {
      this.selection(null, ts[as].get('textSelection'));
    }
  }.observes('activeSelection', 'value'),

  /** @private
    Updates the value according the key.
  */
  updateValue: function(key, upOrDown) {
    // 0 is DOWN - 1 is UP
    var newValue = (upOrDown === 0) ? -1 : 1;
    var value = this.get('value'), hour;
    switch(key) {
      case '%a': case '%d': case '%j': this.set('value', value.advance({ day: newValue })); break;
      case '%b': case '%m': this.set('value', value.advance({ month: newValue })); break;
      case '%H': case '%I': this.set('value', value.advance({ hour: newValue })); break;
      case '%M': this.set('value', value.advance({ minute: newValue })); break;
      case '%p': {
        hour = value.get('hour') >= 12 ? -12 : 12;
        this.set('value', value.advance({ hour: hour }));
        break;
      }
      case '%S': this.set('value', value.advance({ second: newValue })); break;
      case '%U': this.set('value', value.advance({ week1: newValue })); break;
      case '%W': this.set('value', value.advance({ week0: newValue })); break;
      case '%y': case '%Y': this.set('value', value.advance({ year: newValue })); break;
    }
  },

  /** @private and weird */
  _selectRootElement: function() {
    // TODO: This is a solution while I don't found how we
    // receive the last key from the last input.
    // (to see if is entering with Tab or backTab)
    /*if (this.get('activeSelection') === -1) {
    }*/
  },

  // ..........................................................
  // Date Picker support
  //

  /** @private Bound to the date picker. */
  _datePickerValue: null,

  /** @private Handles syncing the date picker's value to our value, depending on settings. */
  _scdfv_datePickerValueDidChange: function() {
    // If we're set to update on change, update.
    if (this.get('updateOnPickerChange')) {
      this.setIfChanged('value', this.get('_datePickerValue'));
    }
    // If we're set to dismiss on change and we're visible, update then dismiss.
    if (this.get('dismissPickerOnChange') && this.get('datePickerIsShowing') && !this._isProxyingKeystroke) {
      this.setIfChanged('value', this.get('_datePickerValue'));
      this.set('datePickerIsShowing', NO);
      this.resignFirstResponder();
    }
    delete this._isProxyingKeystroke;
  }.observes('_datePickerValue'),

  /** @private Handles syncing our value to the date picker's value, in case it changes from elsewhere. */
  _scdfv_valueDidChange: function() {
    this.setIfChanged('_datePickerValue', this.get('value'));
  }.observes('value'),

  /** @private If the user dismisses the modal, sync up the values and resign. */
  _scdfv_pickerDidDismissByModalPane: function() {
    this.setIfChanged('value', this.get('_datePickerValue'));
    this.resignFirstResponder();
  },

  /** @private Instantiates the datePicker if needed. */
  _scdfv_instantiateDatePicker: function() {
    if (!this.getPath('datePicker.isClass')) return;
    this.datePicker = this.datePicker.create({
      _dateFieldView: this,
      valueBinding: SC.Binding.from('_datePickerValue', this),
      // Keystrokes should be handled by the DateFieldView.
      acceptsKeyPane: NO,
      acceptsFirstResponder: NO,
      // Alert the date field view when the modal pane gets clicked.
      modalPaneDidClick: function() {
        var ret = sc_super();
        this._dateFieldView._scdfv_pickerDidDismissByModalPane();
        return ret;
      },
      // Cleanup.
      destroy: function() {
        this._dateFieldView = null;
        return sc_super();
      }
    });
  },

  /** @private
    Attempts to proxy the keystroke event (e.g. 'moveUp') to the date picker. Returns YES if the
    date picker accepted the proxy.
  */
  _scdfv_proxyKeystrokeToDatePicker: function(keyEventName, keyEvent) {
    this._isProxyingKeystroke = YES; // statehack
    if (!this.get('datePickerIsShowing')) return NO;
    if (!this.getPath('datePicker.isObject')) return NO;
    if (this.getPath('datePicker.isPane')) return this.datePicker.sendEvent(keyEventName, keyEvent);
    else return this.datePicker.tryToPerform(keyEventName, keyEvent);
    delete this._isProxyingKeystroke;
  },

  /** @private Shows or hides the date picker as necessary. */
  _scdfv_manageDatePickerShowing: function() {
    // See if we should show or not.
    var shouldShow = NO;
    if (this.get('useDatePicker')) {
      var activeSelection = this.get('activeSelection'),
          tabsSelections = this.get('tabsSelections'),
          activeTab = tabsSelections[activeSelection];
      if (activeTab && activeTab.get('isDate')) shouldShow = YES;
    }

    // Show if shouldShow.
    if (shouldShow) {
      // Pop up.
      this.set('datePickerIsShowing', YES);
    }
    // Hide if not shouldShow.
    else {
      this.set('datePickerIsShowing', NO);
    }
  }.observes('activeSelection', 'useDatePicker'),

  /** @private */
  didBecomeFirstResponder: function() {
    var ret = sc_super();
    this._scdfv_manageDatePickerShowing();
    return ret;
  },
  /** @private */
  willLoseFirstResponder: function() {
    this.set('datePickerIsShowing', NO);
  },
  /** @private */
  destroy: function() {
    sc_super();
    if (this.datePicker && !this.datePicker.isClass) this.datePicker.destroy();
    this.datePicker = null;
  },

  // ..........................................................
  // Key Event Support
  //

  /** @private */
  keyDown: function(evt) {
    if (this.interpretKeyEvents(evt)) {
      evt.stop();
      return YES;
    }
    return sc_super();
  },

  /** @private - I don't think this does anything. Remove? */
  ctrl_a: function() {
    return YES;
  },

  /** @private */
  insertText: function(evt) {
    return YES;
  },

  /** @private */
  moveUp: function(evt) {
    if (this._scdfv_proxyKeystrokeToDatePicker('moveUp', evt)) return YES;
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 1);
    return YES;
  },

  /** @private */
  moveDown: function(evt) {
    if (this._scdfv_proxyKeystrokeToDatePicker('moveDown', evt)) return YES;
    var as = this.get('activeSelection');
    var ts = this.get('tabsSelections');
    this.updateValue(ts[as].get('key'), 0);
    return YES;
  },

  /** @private */
  moveRight: function(evt) {
    if (this._scdfv_proxyKeystrokeToDatePicker('moveRight', evt)) return YES;
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns === ts.length) {
      ns = 0;
    }
    this.set('activeSelection', ns);
    return YES;
  },

  /** @private */
  moveLeft: function(evt) {
    if (this._scdfv_proxyKeystrokeToDatePicker('moveLeft', evt)) return YES;
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') - 1;
    if (ns === -1) {
      ns = ts.length - 1;
    }
    this.set('activeSelection', ns);
    return YES;
  },

  /** @private */
  insertNewline: function(evt) {
    // Give the date picker a chance to react first.
    this._scdfv_proxyKeystrokeToDatePicker('insertNewline', evt);
    if (this.get('datePickerIsShowing')) {
      this.setIfChanged('value', this.get('_datePickerValue'));
      this.set('datePickerIsShowing', NO);
      this.resignFirstResponder();
    }
    return YES;
  },

  /** @private */
  cancel: function(evt) {
    // Give the date picker a chance to react first.
    this._scdfv_proxyKeystrokeToDatePicker('cancel', evt);
    if (this.get('datePickerIsShowing')) {
      this.set('datePickerIsShowing', NO);
      this.resignFirstResponder();
    }
    return YES;
  },

  /** @private */
  insertTab: function(evt) {
    var ts = this.get('tabsSelections');
    var ns = this.get('activeSelection') + 1;
    if (ns < ts.length) {
      this.set('activeSelection', ns);
      return YES;
    }
    return NO;
  },

  /** @private */
  insertBacktab: function(evt) {
    var ns = this.get('activeSelection') - 1;
    if (ns !== -1) {
      this.set('activeSelection', ns);
      return YES;
    }
    return NO;
  },

  /** @private */
  mouseUp: function(evt) {
    var ret = sc_super();
    // Select text based on current caret position.
    var cs = this.get('selection');
    if (SC.none(cs)) {
      this.set('activeSelection', 0);
    } else {
      var caret = cs.get('start');
      var ts = this.get('tabsSelections');
      var _tsLen = ts.length, cts;
      for(var i=0; i<_tsLen; i++) {
        cts = ts[i].get('textSelection');
        if (caret >= cts.get('start') && caret <= cts.get('end')) {
          this.set('activeSelection', i);
        }
      }
    }

    return ret;
  },

  /** @private */
  deleteBackward: function(evt) {
    return YES;
  },

  /** @private */
  deleteForward: function(evt) {
    return YES;
  }

});
