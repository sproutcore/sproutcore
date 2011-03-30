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
    The first child of this view for the purposes of tab ordering. If not
    provided, the first element of childViews is used. Override this if
    your view displays its child views in an order different from that
    given in childViews.

    @type SC.View
    @default null
  */
  firstKeyView: null,

  /**
    @private

    Actually calculates the firstKeyView as described in firstKeyView.

    @returns {SC.View}
  */
  _getFirstKeyView: function() {
    // if first was given, just return it
    var firstKeyView = this.get('firstKeyView');
    if(firstKeyView) return firstKeyView;

    // otherwise return the first childView
    var childViews = this.get('childViews');
    if(childViews) return childViews[0];
  },

  /**
    The last child of this view for the purposes of tab ordering. If not set, can be generated two different ways:
    1. If firstKeyView is provided, it will be generated by starting from firstKeyView and traversing the childViews nextKeyView properties.
    2. If firstKeyView is not provided, it will simply return the last element of childViews.

    The first way is not very efficient, so if you provide firstKeyView you should also provide lastKeyView.

    @type SC.View
    @default null
  */
  lastKeyView: null,

  /**
    @private

    Actually calculates the lastKeyView as described in lastKeyView.

    @returns {SC.View}
  */
  _getLastKeyView: function() {
    // if last was given, just return it
    var lastKeyView = this.get('lastKeyView');
    if(lastKeyView) return lastKeyView;

    var view,
    prev = this.get('firstKeyView');

    // if first was given but not last, build by starting from first and
    // traversing until we hit the end. this is obviously the least efficient
    // way
    if(prev) {
      while(view = prev.get('nextKeyView')) {
        prev = view;
      }

      return prev;
    }

    // if neither was given, it's more efficient to just return the last
    // childView
    else {
      var childViews = this.get('childViews');

      if(childViews) return childViews[childViews.length - 1];
    }
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a firstKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets nextKeyView should also set previousKeyView.

    @type SC.View
    @default null
  */

  nextKeyView: undefined,

  /**
    @private

    Gets the next key view by checking if the user set it and otherwise just
    getting the next by index in childViews.

    @return {SC.View}
  */
  _getNextKeyView: function() {
    var nextKeyView = this.get('nextKeyView');
    if(nextKeyView !== undefined) return nextKeyView;

    var pv = this.get('parentView');
    
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) + 1];
    }
  },

  /**
    Computes the next valid key view. This is the next key view that
    acceptsFirstResponder. If the current view is not valid, it will first traverse
    its children before trying siblings. If the current view is the only valid view,
    the current view will be returned. Will return null if no valid view can be
    found.

    @property
    @type SC.View
  */
  nextValidKeyView: function() {
    var cur = this, next;

    while(YES) {
      next = null;

      // only bother to check if we are visible
      if(cur.get('isVisibleInWindow')) next = cur._getFirstKeyView();

      // if we have no children, check our sibling
      if(!next) next = cur._getNextKeyView();

      // if we have no children or siblings, unroll up closest parent that has a
      // next sibling
      if(!next) while(cur = cur.get('parentView')) {
        if(next = cur._getNextKeyView()) break;
      }

      // if no parents have a next sibling, start over from the beginning
      if(!next) next = this.get('pane');

      // if it's a valid firstResponder, we're done!
      if(next.get('isVisibleInWindow') && next.get('acceptsFirstResponder')) return next;
      // this will only happen if no views are visible and accept first responder
      else if(next === this) return null;
      // otherwise keep looking
      cur = next;
    }

  }.property('nextKeyView'),

  /**
    Optionally points to the previous key view that should gain focus when tabbing
    through an interface.  If this is not set, then the previous key view will
    be set automatically to the previous sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a lastKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets previousKeyView should also set nextKeyView.

    @type SC.View
    @default null
  */
  previousKeyView: undefined,

  /**
    @private

    Gets the previous key view by checking if the user set it and otherwise just
    getting the previous by index in childViews.

    @return {SC.View}
  */
  _getPreviousKeyView: function() {
    var previousKeyView = this.get('previousKeyView');
    if(previousKeyView !== undefined) return previousKeyView;

    var pv = this.get('parentView');

    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) - 1];
    }
  },

  /**
    Computes the previous valid key view. This is the previous key view that
    acceptsFirstResponder. If the current view is not valid, it will first traverse
    its children before trying siblings. If the current view is the only valid view,
    the current view will be returned. Will return null if no valid view can be
    found.

    @property
    @type SC.View
  */
  // TODO: clean this up
  previousValidKeyView: function() {
    var cur = this, prev;

    while(YES) {
      if(cur.get('parentView')) prev = cur._getPreviousKeyView();
      else prev = cur;

      if(prev) {
        do {
          cur = prev;
          prev = prev._getLastKeyView();
        } while(prev && prev.get('isVisibleInWindow'));

        if(!prev) prev = cur;
      }

      else {
        prev = cur.get('parentView');
      }

      if(prev.get('isVisibleInWindow') && prev.get('acceptsFirstResponder')) return prev;
      else if(prev === this) return null;
      cur = prev;
    }
  }.property('previousKeyView'),
});

