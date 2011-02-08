sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    inserts the pane's rootElement into the top of the passed DOM element.

    @param {DOMElement} elem the element to append to
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
