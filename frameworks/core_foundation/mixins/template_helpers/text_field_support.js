// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

*/
SC.TextFieldSupport = /** @scope SC.TextFieldSupport.prototype */{
  
  /** @private
    Used internally to store value because the layer may not exist
  */
  _value: null,
  
  /**
    @type String
    @default null
  */
  value: function(key, value) {
    var input = this.$('input');

    if (value !== undefined) {
      this._value = value;
      input.val(value);
    } else {
      if (input.length > 0) {
        value = this._value = input.val();
      } else {
        value = this._value;
      }
    }

    return value;
  }.property().idempotent(),

  didCreateLayer: function() {
    var input = this.$('input');

    input.val(this._value);

    SC.Event.add(input, 'focus', this, this.focusIn);
    SC.Event.add(input, 'blur', this, this.focusOut);
  },

  focusIn: function(event) {
    this.becomeFirstResponder();
    this.tryToPerform('focus', event);
  },

  focusOut: function(event) {
    this.resignFirstResponder();
    this.tryToPerform('blur', event);
  },

  /** @private
    Make sure our input value is synced with any bindings.
    In some cases, such as auto-filling, a value can get
    changed without an event firing. We could do this
    on focusOut, but blur can potentially get called
    after other events.
  */
  willLoseFirstResponder: function() {
    this.notifyPropertyChange('value');
  },

  keyUp: function(event) {
    if (event.keyCode === 13) {
      return this.tryToPerform('insertNewline', event);
    } else if (event.keyCode === 27) {
      return this.tryToPerform('cancel', event);
    }
  }
};

