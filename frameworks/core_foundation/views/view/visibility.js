sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Set to YES to indicate the view has visibility support added.

    @deprecated Version 1.10
  */
  hasVisibility: YES,

  /**
    This property has been deprecated in favor of the SC.View maintained
    properties:  `isAttached`, `isShown` and `isHidden`. To determine actual
    visibility of a view use these properties.

    @see SC.View#isAttached
    @see SC.View#isShown
    @see SC.View#isHidden
    @default false
    @deprecated Version 1.10
  */
  isVisibleInWindow: false,

  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function () {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),

  /**
    The visibility of the view does not need to be computed any longer as it
    is maintained by the internal SC.View statechart.

    @deprecated Version 1.10
    @returns {SC.View} receiver
  */
  recomputeIsVisibleInWindow: function () {
    //@if(debug)
    SC.warn("Developer Warning: Calling recomputeIsVisibleInWindow() is no longer necessary and has been deprecated.");
    //@endif

    return this;
  }

});
