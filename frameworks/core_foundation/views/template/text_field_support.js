SC.TextFieldSupport = {
  value: function() {
    return this.$('input').val();
  }.property(),

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

  keyUp: function(event) {
    if (event.keyCode === 13) {
      return this.tryToPerform('insertNewline', event);
    } else if (event.keyCode === 27) {
      return this.tryToPerform('cancel', event);
    }
  }
};

