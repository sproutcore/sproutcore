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
  nextKeyView: null,

  /**
    @private

    Gets the next key view by checking if the user set it and otherwise just
    getting the next by index in childViews.

    @return {SC.View}
  */
  _getNextKeyView: function() {
    var nextKeyView = this.get('nextKeyView');
    if(nextKeyView) return nextKeyView;

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
    return this._computeNextValidKeyView(this);
  }.property('nextKeyView'),

  /**
    @private

    Computes the actual next keyView by performing a depth first search starting at the current view.

    @params {SC.View} startView the view the search started from; used to
    prevent infinite recursion if no valid view can be found and the search wraps
    all the way around

    @returns {SC.View}
  */
  _computeNextValidKeyView: function(startView) {
    var next;

    // don't check our children if we aren't visible
    if(this.get('isVisibleInWindow')) next = this._getFirstKeyView();

    // if we have no children, check our sibling
    if(!next) next = this._getNextKeyView();

    // if we have children or siblings, see if they are valid
    if(next) return next._validOrNextValid(startView);

    // if they weren't, then go up our parents until we find one with a sibling
    // in a normal DFS this would be done implicitly when unrolling the stack,
    // but we don't have the full stack since we didn't start at the root view
    // so we have to do it manually
    var parentView = this;
    while(parentView = parentView.get('parentView')) {
      next = parentView._getNextKeyView();

      if(next) return next._validOrNextValid(startView);
    }

    // if we reach root without finding one, start over from the beginning
    return this.get('pane')._computeNextValidKeyView(startView);
  },

  /**
    @private

    Returns the current view if it is a valid keyView, otherwise recurses back
    to finding the next valid keyView.

    @params {SC.View} startView the view the search started from; used to
    prevent infinite recursion if no valid view can be found and the search wraps
    all the way around

    @returns {SC.View}
  */
  _validOrNextValid: function(startView) {
    // if we are a valid target, then success!
    if(this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')) return this;

    // prevent infinite loop if nothing is a valid target (this shouldn't ever
    // happen, but we still want to behave gracefully if it does)
    else if(this === startView) return null;

    // otherwise keep searching starting here
    else return this._computeNextValidKeyView(startView);
  },

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
  previousKeyView: null,

  /**
    @private

    Gets the previous key view by checking if the user set it and otherwise just
    getting the previous by index in childViews.

    @return {SC.View}
  */
  _getPreviousKeyView: function() {
    var previousKeyView = this.get('previousKeyView');
    if(previousKeyView) return previousKeyView;

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
  previousValidKeyView: function() {
    return this._computePreviousValidKeyView(this);
  }.property('previousKeyView'),

  /**
    @private

    Computes the actual previous keyView by performing a depth first search starting at the current view.

    @params {SC.View} startView the view the search started from; used to
    prevent infinite recursion if no valid view can be found and the search wraps
    all the way around

    @returns {SC.View}
  */
  // TODO: combine this with _computeNextValidKeyView by passing the next and
  // first functions
  _computePreviousValidKeyView: function(startView) {
    var prev;

    // don't check our children if we aren't visible
    if(this.get('isVisibleInWindow')) next = this._getLastKeyView();

    // if we have no children, check our sibling
    if(!next) next = this._getPreviousKeyView();

    // if we have children or siblings, see if they are valid
    if(next) return next._validOrPreviousValid(startView);

    // if they weren't, then go up our parents until we find one with a sibling
    // in a normal DFS this would be done implicitly when unrolling the stack,
    // but we don't have the full stack since we didn't start at the root view
    // so we have to do it manually
    var parentView = this;
    while(parentView = parentView.get('parentView')) {
      next = parentView._getPreviousKeyView();

      if(next) return next._validOrPreviousValid(startView);
    }

    // if we reach root without finding one, start over from the beginning
    return this.get('pane')._computePreviousValidKeyView(startView);
  },

  /**
    @private

    Returns the current view if it is a valid keyView, otherwise recurses back
    to finding the next valid keyView.

    @params {SC.View} startView the view the search started from; used to
    prevent infinite recursion if no valid view can be found and the search wraps
    all the way around

    @returns {SC.View}
  */
  _validOrPreviousValid: function(startView) {
    // if we are a valid target, then success!
    if(this.get('acceptsFirstResponder') && this.get('isVisibleInWindow')) return this;

    // prevent infinite loop if nothing is a valid target (this shouldn't ever
    // happen, but we still want to behave gracefully if it does)
    else if(this === startView) return null;

    // otherwise keep searching starting here
    else return this._computePreviousValidKeyView(startView);
  }
});

