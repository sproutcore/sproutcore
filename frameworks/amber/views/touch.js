sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  // ..........................................................
  // MULTITOUCH SUPPORT
  //
  /**
    Set to YES if you want to receive touch events for each distinct touch (rather than only
    the first touch start and last touch end).
  */
  acceptsMultitouch: NO,

  /**
    Is YES if the view is currently being touched. NO otherwise.
  */
  hasTouch: NO,

  /**
    A boundary set of distances outside which the touch will not be considered "inside" the view anymore.

    By default, up to 50px on each side.
  */
  touchBoundary: { left: 50, right: 50, top: 50, bottom: 50 },

  /**
    @private
    A computed property based on frame.
  */
  _touchBoundaryFrame: function (){
    return this.get("parentView").convertFrameToView(this.get('frame'), null);
  }.property("frame", "parentView").cacheable(),

  /**
    Returns YES if the provided touch is within the boundary.
  */
  touchIsInBoundary: function(touch) {
    var f = this.get("_touchBoundaryFrame"), maxX = 0, maxY = 0, boundary = this.get("touchBoundary");
    var x = touch.pageX, y = touch.pageY;

    if (x < f.x) {
      x = f.x - x;
      maxX = boundary.left;
    } else if (x > f.x + f.width) {
      x = x - (f.x + f.width);
      maxX = boundary.right;
    } else {
      x = 0;
      maxX = 1;
    }

    if (y < f.y) {
      y = f.y - y;
      maxY = boundary.top;
    } else if (y > f.y + f.height) {
      y = y - (f.y + f.height);
      maxY = boundary.bottom;
    } else {
      y = 0;
      maxY = 1;
    }

    if (x > 100 || y > 100) return NO;
    return YES;
  }
});
