sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Inserts the pane's layer as the first child of the passed element.

    @param {DOMElement} elem the element to prepend to
    @returns {SC.Pane} receiver
  */
  prependTo: function(elem) {
    return this.insert(function(layer) {
      elem.insertBefore(layer, elem.firstChild);
    });
  },

  /**
    This method has no effect in the pane.  Instead use remove().

    @returns {void}
  */
  removeFromParent: function() {
    throw SC.Error.desc("SC.Pane cannot be removed from its parent, since it's the root. Did you mean remove()?");
  }
});
