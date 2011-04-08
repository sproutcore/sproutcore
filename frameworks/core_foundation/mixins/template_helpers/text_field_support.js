// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

*/
SC.TextFieldSupport = /** @scope SC.TextFieldSupport.prototype */{
  value: function(key, value) {
    if (value !== undefined) {
      this.$('input').val(value);
    } else {
      value = this.$('input').val();
    }

    return value;
  }.property().idempotent(),

  didCreateLayer: function() {
    SC.Event.add(this.$('input'), 'focus', this, this.focusIn);
    SC.Event.add(this.$('input'), 'blur', this, this.focusOut);
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

