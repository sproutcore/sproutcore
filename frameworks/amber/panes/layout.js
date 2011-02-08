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

    var wframe = this.get('currentWindowSize'),
        wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    if (wframe){
      wDim.width = wframe.width;
      wDim.height = wframe.height;
    }
    // Call the RootResponder instance...
    else if (SC.RootResponder.responder) {
      var wSize = SC.RootResponder.responder.get('currentWindowSize');
      if (wSize){
        wDim.width = wSize.width;
        wDim.height = wSize.height;
      }
    }
    // If all else fails then we need to Calculate it from the window size and DOM
    else {
      var size, body, docElement;
      if(!this._bod || !this._docElement){
        body = document.body;
        docElement = document.documentElement;
        this._body=body;
        this._docElement=docElement;
      }else{
        body = this._body;
        docElement = this._docElement;
      }

      if (window.innerHeight) {
        wDim.width = window.innerWidth;
        wDim.height = window.innerHeight;
      } else if (docElement && docElement.clientHeight) {
        wDim.width = docElement.clientWidth;
        wDim.height = docElement.clientHeight;
      } else if (body) {
        wDim.width = body.clientWidth;
        wDim.height = body.clientHeight;
      }
      this.windowSizeDidChange(null, wDim);
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
  }.observes('layout')
});
