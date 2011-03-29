sc_require("views/view");

SC.View.reopen({
  // ..........................................................
  // KEY RESPONDER
  //

  /** @property
    YES if the view is currently first responder and the pane the view belongs
    to is also key pane.  While this property is set, you should expect to
    receive keyboard events.
  */
  isKeyResponder: NO,

  /**
    This method is invoked just before you lost the key responder status.
    The passed view is the view that is about to gain keyResponder status.
    This gives you a chance to do any early setup. Remember that you can
    gain/lose key responder status either because another view in the same
    pane is becoming first responder or because another pane is about to
    become key.

    @param {SC.Responder} responder
  */
  willLoseKeyResponderTo: function(responder) {},

  /**
    This method is invoked just before you become the key responder.  The
    passed view is the view that is about to lose keyResponder status.  You
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because
    another view in the same pane is becoming first responder or because
    another pane is about to become key.

    @param {SC.Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder) {},

  /**
    Invokved just after the responder loses key responder status.
  */
  didLoseKeyResponderTo: function(responder) {},

  /**
    Invoked just after the responder gains key responder status.
  */
  didBecomeKeyResponderFrom: function(responder) {},

  /**
    This method will process a key input event, attempting to convert it to
    an appropriate action method and sending it up the responder chain.  The
    event is converted using the SC.KEY_BINDINGS hash, which maps key events
    into method names.  If no key binding is found, then the key event will
    be passed along using an insertText() method.

    @param {SC.Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(), cmd = codes[0], chr = codes[1], ret;

    if (!cmd && !chr) { return null ; } //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      var methodName = SC.MODIFIED_KEY_BINDINGS[cmd] || SC.BASE_KEY_BINDINGS[cmd.match(/[^_]+$/)[0]];
      if (methodName) {
        var target = this, pane = this.get('pane'), handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    }

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert
      // of the text.  Since this is not an action, do not send it up the
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===YES ? this : ret) : null ; // map YES|NO => this|nil
    }

    return null ; //nothing to do.
  },

  /**
    This method is invoked by interpretKeyEvents() when you receive a key
    event matching some plain text.  You can use this to actually insert the
    text into your application, if needed.

    @param {SC.Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return NO ;
  },

  /**
    Recursively travels down the view hierarchy looking for a view that
    implements the key equivalent (returning to YES to indicate it handled
    the event).  You can override this method to handle specific key
    equivalents yourself.

    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return YES.
    Otherwise, you should just return sc_super.

    @param {String} keystring
    @param {SC.Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = NO,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1, view ;
    while (!ret && (++idx < len)) {
      view = childViews[idx];

      ret = view.tryToPerform('performKeyEquivalent', keystring, evt);
    }

    return ret ;
  },

  firstKeyView: null,

  getFirstKeyView: function() {
    var firstKeyView = this.get('firstKeyView');
    if(firstKeyView) return firstKeyView;

    var childViews = this.get('childViews');

    if(childViews) return childViews[0];
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next child.
  */
  nextKeyView: null,

  getNextKeyView: function() {
    var nextKeyView = this.get('nextKeyView');
    if(nextKeyView) return nextKeyView;

    var pv = this.get('parentView');
    
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) + 1];
    }
  },

  lastKeyView: null,

  getLastKeyView: function() {
    var lastKeyView = this.get('lastKeyView');
    if(lastKeyView) return lastKeyView;

    var view,
    prev = this.get('firstKeyView');

    while(view = prev.get('nextKeyView')) {
      prev = view;
    }

    return prev;
  },

  /**
    Computes the next valid key view, possibly returning the receiver or null.
    This is the next key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    return this._computeNextValidKeyView(this);
  }.property('nextKeyView'),

  _computeNextValidKeyView: function(startView) {
    var next;

    // don't check our children if we aren't visible
    if(this.get('isVisibleInWindow')) next = this.getFirstKeyView();

    // if we have no children, check our sibling
    if(!next) next = this.getNextKeyView();

    // if we have children or siblings, see if they are valid
    if(next) return next._validOrNextValid(startView);

    // if they weren't, then go up our parents until we find one with a sibling
    var parentView = this;
    while(parentView = parentView.get('parentView')) {
      next = parentView.getNextKeyView();

      if(next) return next._validOrNextValid(startView);
    }

    // if we reach root without finding one, start over from the beginning
    return this.get('pane')._computeNextValidKeyView(startView);
  },

  _validOrNextValid: function(startView) {
    // prevent infinite loop if nothing is a valid target (this shouldn't ever
    // happen, but we still want to behave gracefully if it does)
    if(this === startView) return null;
    
    // if we are a valid target, then success!
    else if(this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')) return this;

    // otherwise keep searching starting here
    else return this._computeNextValidKeyView(startView);
  },

  /**
    Optionally points to the previous key view that should gain focus when
    tabbing through the interface. If this is not set then the previous
    key view will be set automatically to the previous child.
  */
  previousKeyView: null,

  getPreviousKeyView: function() {
    var previousKeyView = this.get('previousKeyView');
    if(previousKeyView) return previousKeyView;

    var pv = this.get('parentView');

    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) - 1];
    }
  },

  /**
    Computes the previous valid key view, possibly returning the receiver or
    null.  This is the previous key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  previousValidKeyView: function() {
    return this.computePreviousValidKeyView(this);
  }.property('previousKeyView'),

  _computePreviousValidKeyView: function(startView) {
    var prev;

    // don't check our children if we aren't visible
    if(this.get('isVisibleInWindow')) next = this.getLastKeyView();

    // if we have no children, check our sibling
    if(!next) next = this.getPreviousKeyView();

    // if we have children or siblings, see if they are valid
    if(next) return next._validOrPreviousValid(startView);

    // if they weren't, then go up our parents until we find one with a sibling
    var parentView = this;
    while(parentView = parentView.get('parentView')) {
      next = parentView.getPreviousKeyView();

      if(next) return next._validOrPreviousValid(startView);
    }

    // if we reach root without finding one, start over from the beginning
    return this.get('pane')._computePreviousValidKeyView(startView);
  },

  _validOrPreviousValid: function(startView) {
    // prevent infinite loop if nothing is a valid target (this shouldn't ever
    // happen, but we still want to behave gracefully if it does)
    if(this === startView) return null;
    
    // if we are a valid target, then success!
    else if(this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')) return this;

    // otherwise keep searching starting here
    else return this._computePreviousValidKeyView(startView);
  }
});
