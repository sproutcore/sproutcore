sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  recomputeDependentProperties: function(original) {
    this.recomputeIsVisibleInWindow();
    original();
  }.enhance()

});
