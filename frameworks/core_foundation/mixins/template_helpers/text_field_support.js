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

    // It is possible for the user to alter the value of a textfield without
    // a keydown, keypress, keyup, change or blur, by pasting or cutting text
    // using the edit or contextual menus of the browser.
    SC.Event.add(this.$('input'), 'paste', this, this.valueChanged);
    SC.Event.add(this.$('input'), 'cut', this, this.valueChanged);
  },

  focusIn: function(event) {
    this.becomeFirstResponder();
    this.tryToPerform('focus', event);
  },

  focusOut: function(event) {
    this.resignFirstResponder();
    this.tryToPerform('blur', event);
  },

  valueChanged: function(event) {
    this.invokeLast(function() {
      this.notifyPropertyChange('value');
    });
  },

  keyUp: function(event) {
    if (event.keyCode === SC.Event.KEY_RETURN) {
      return this.tryToPerform('insertNewline', event);
    } else if (event.keyCode === SC.Event.KEY_ESC) {
      return this.tryToPerform('cancel', event);
    }

    // Observers will often want the value of the textfield as
    // it changes so notify on each key up.
    // Note: this will not capture repeated keypress events
    // (which the root responder relays through keyDown)
    this.notifyPropertyChange('value');
  }
};

