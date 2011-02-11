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

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next child.
  */
  nextKeyView: null,

  /**
    Computes the next valid key view, possibly returning the receiver or null.
    This is the next key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var seen = [],
        rootView = this.get('pane'), ret = this.get('nextKeyView');

    if(!ret) { ret = rootView._computeNextValidKeyView(this, seen); }

    if(SC.TABBING_ONLY_INSIDE_DOCUMENT && !ret) {
      ret = rootView._computeNextValidKeyView(rootView, seen);
    }

    return ret ;
  }.property('nextKeyView'),

  _computeNextValidKeyView: function(currentView, seen) {
    var ret = this.get('nextKeyView'),
        children, i, childLen, child;
    if(this !== currentView && seen.indexOf(currentView)!=-1 &&
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles

    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=0, childLen = children.length; i<childLen; i++){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computeNextValidKeyView(currentView, seen);
        }
        if (ret) { return ret; }
      }
      ret = null;
    }
    return ret ;
  },

  /**
    Optionally points to the previous key view that should gain focus when
    tabbing through the interface. If this is not set then the previous
    key view will be set automatically to the previous child.
  */
  previousKeyView: null,

  /**
    Computes the previous valid key view, possibly returning the receiver or
    null.  This is the previous key view that acceptsFirstResponder.

    @property
    @type SC.View
  */
  previousValidKeyView: function() {
    var seen = [],
        rootView = this.pane(), ret = this.get('previousKeyView');
    if(!ret) { ret = rootView._computePreviousValidKeyView(this, seen); }
    return ret ;
  }.property('previousKeyView'),

  _computePreviousValidKeyView: function(currentView, seen) {
    var ret = this.get('previousKeyView'),
        children, i, child;

    if(this !== currentView && seen.indexOf(currentView)!=-1 &&
      this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')){
      return this;
    }
    seen.push(this); // avoid cycles

    // find next sibling
    if (!ret) {
      children = this.get('childViews');
      for(i=children.length-1; 0<=i; i--){
        child = children[i];
        if(child.get('isVisibleInWindow') && child.get('isVisible')){
          ret = child._computePreviousValidKeyView(currentView, seen);
        }
        if (ret) { return ret; }
      }
      ret = null;
    }
    return ret ;
  }
});
