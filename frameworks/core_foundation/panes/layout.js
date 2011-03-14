sc_require("panes/pane");

SC.Pane.reopen(
  /** @scope SC.Pane.prototype */ {

  /**
    Last known window size.

    @property {Rect}
  */
  currentWindowSize: null,

  /**
    The parent dimensions are always the last known window size.

    @returns {Rect} current window size
  */
  computeParentDimensions: function(frame) {
    if(this.get('designer') && SC.suppressMain) { return sc_super(); }

    var wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    // There used to be a whole bunch of code right here to calculate
    // based first on a stored window size, then on root responder, then
    // from document... but a) it is incorrect because we don't care about
    // the window size, but instead, the clientWidth/Height of the body, and
    // b) the performance benefits are not worth complicating the code that much.
    if (document && document.body) {
      wDim.width = document.body.clientWidth;
      wDim.height = document.body.clientHeight;

      // IE7 is the only browser which reports clientHeight _including_ scrollbar.
      if (SC.browser.isIE && SC.browser.compareVersion("7.0") === 0) {
        var scrollbarSize = SC.platform.get('scrollbarSize');
        if (document.body.scrollWidth > wDim.width) {
          wDim.width -= scrollbarSize;
        }
        if (document.body.scrollHeight > wDim.height) {
          wDim.height -= scrollbarSize;
        }
      }
    }

    // If there is a minWidth or minHeight set on the pane, take that
    // into account when calculating dimensions.

    if (layout.minHeight || layout.minWidth) {
      if (layout.minHeight) {
        wDim.height = Math.max(wDim.height, layout.minHeight);
      }
      if (layout.minWidth) {
        wDim.width = Math.max(wDim.width, layout.minWidth);
      }
    }
    return wDim;
  },

  /** @private Disable caching due to an known bug in SC. */
  frame: function() {
    if(this.get('designer') && SC.suppressMain) { return sc_super(); }
    return this.computeFrameWithParentFrame(null) ;
  }.property(),

  /**
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.

    @param {Rect} oldSize the old window size
    @param {Rect} newSize the new window size
    @returns {SC.Pane} receiver
  */
  windowSizeDidChange: function(oldSize, newSize) {
    this.set('currentWindowSize', newSize) ;
    this.parentViewDidResize(); // start notifications.
    return this ;
  },

  /** @private */
  paneLayoutDidChange: function() {
    this.invokeOnce(this.updateLayout);
  }.observes('layout'),

  recomputeDependentProperties: function(original) {
    this.set('currentWindowSize', this.rootResponder.computeWindowSize()) ;
    original();
  }.enhance()
});
