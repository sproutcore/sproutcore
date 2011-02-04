require("views/view");
sc_require('views/layout_style') ;

/** Select a horizontal layout for various views.*/
SC.LAYOUT_HORIZONTAL = 'sc-layout-horizontal';

/** Select a vertical layout for various views.*/
SC.LAYOUT_VERTICAL = 'sc-layout-vertical';

/** @private */
SC._VIEW_DEFAULT_DIMS = 'marginTop marginLeft'.w();

/**
  Layout properties to take up the full width of a parent view.
*/
SC.FULL_WIDTH = { left: 0, right: 0 };

/**
  Layout properties to take up the full height of a parent view.
*/
SC.FULL_HEIGHT = { top: 0, bottom: 0 };

/**
  Layout properties to center.  Note that you must also specify a width and
  height for this to work.
*/
SC.ANCHOR_CENTER = { centerX: 0, centerY: 0 };

/**
  Layout property for width, height
*/

SC.LAYOUT_AUTO = 'auto';


SC.View.reopen(
  /** @scope SC.View.prototype */ {

  concatenatedProperties: ["layoutProperties"],

  /**
    Optional background color.  Will be applied to the view's element if
    set.  This property is intended for one-off views that need a background
    element.  If you plan to create many view instances it is probably better
    to use CSS.

    @property {String}
  */
  backgroundColor: null,

  /**
    Activates use of brower's static layout. To activate, set this
    property to YES.

    @property {Boolean}
  */
  useStaticLayout: NO,

  // ...........................................
  // LAYOUT
  //

  /**
    The 'frame' property depends on the 'layout' property as well as the
    parent view's frame.  In order to properly invalidate any cached values,
    we need to invalidate the cache whenever 'layout' changes.  However,
    observing 'layout' does not guarantee that; the observer might not be run
    immediately.

    In order to avoid any window of opportunity where the cached frame could
    be invalid, we need to force layoutDidChange() to always immediately run
    whenever 'layout' is set.
  */
  propertyDidChange: function(key, value, _keepCache) {
    // If the key is 'layout', we need to call layoutDidChange() immediately
    // so that if the frame has changed any cached values (for both this view
    // and any child views) can be appropriately invalidated.

    // To allow layout to be a computed property, we check if any property has
    // changed and if layout is dependent on the property.
    // If it is we call layoutDidChange.
    var layoutChange = false;
    if(typeof this.layout === "function" && this._kvo_dependents) {
      var dependents = this._kvo_dependents[key];
      if(dependents && dependents.indexOf('layout')!=-1) { layoutChange = true; }
    }
    if(key==='layout' || layoutChange) { this.layoutDidChange(); }
    // Resume notification as usual.
    sc_super();
  },


  /**
    This convenience method will take the current layout, apply any changes
    you pass and set it again.  It is more convenient than having to do this
    yourself sometimes.

    You can pass just a key/value pair or a hash with several pairs.  You can
    also pass a null value to delete a property.

    This method will avoid actually setting the layout if the value you pass
    does not edit the layout.

    @param {String|Hash} key
    @param {Object} value
    @returns {SC.View} receiver
  */
  adjust: function(key, value) {
    var layout = SC.clone(this.get('layout')), didChange = NO, cur ;

    if (key === undefined) { return this ; } // nothing to do.

    // handle string case
    if (SC.typeOf(key) === SC.T_STRING) {
      hash = {};
      hash[key] = value;
    } else {
      hash = key;
    }

    for(key in hash) {
      if (!hash.hasOwnProperty(key)) { continue; }

      value = hash[key] ;
      cur = layout[key] ;

      if (value === undefined || cur == value) { continue; }

      if (value === null) {
        delete layout[key] ;
      } else {
        layout[key] = value ;
      }

      didChange = YES;
    }

    // now set adjusted layout
    if (didChange) {
      this.set('layout', layout) ;
    }

    return this ;
  },

  /**
    The layout describes how you want your view to be positions on the
    screen.  You can define the following properties:

    - left: the left edge
    - top: the top edge
    - right: the right edge
    - bottom: the bottom edge
    - height: the height
    - width: the width
    - centerX: an offset from center X
    - centerY: an offset from center Y
    - minWidth: a minimum width
    - minHeight: a minimum height
    - maxWidth: a maximum width
    - maxHeight: a maximum height

    Note that you can only use certain combinations to set layout.  For
    example, you may set left/right or left/width, but not left/width/right,
    since that combination doesn't make sense.

    Likewise, you may set a minWidth/minHeight, or maxWidth/maxHeight, but
    if you also set the width/height explicitly, then those constraints won't
    matter as much.

    Layout is designed to maximize reliance on the browser's rendering
    engine to keep your app up to date.

    @test in layoutStyle
  */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.

    Note that the context of a view's frame is the view's parent frame.  In
    other words, if you want to convert the frame of your view to the global
    frame, then you should do:

    {{{
      var pv = this.get('parentView'), frame = this.get('frame');
      var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    }}}

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;

    // walk up this side
    while (view) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = view.get('layoutView') ;
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while (view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('layoutView') ;
      }
    }

    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },

  /**
    Converts a frame offset in the coordinates of another view system to the
    receiver's view.

    Note that the convext of a view's frame is relative to the view's
    parentFrame.  For example, if you want to convert the frame of view that
    belongs to another view to the receiver's frame you would do:

    {{{
      var frame = view.get('frame');
      var newFrame = this.convertFrameFromView(frame, view.get('parentView'));
    }}}

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
    @test in converFrames
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, f ;

    // walk up this side
    //Note: Intentional assignment of variable f
    while (view && (f = view.get('frame'))) {
      myX += f.x; myY += f.y ;
      view = view.get('parentView') ;
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(view) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = view.get('parentView') ;
      }
    }

    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height } ;
  },

  /**
    Attempt to scroll the view to visible.  This will walk up the parent
    view hierarchy looking looking for a scrollable view.  It will then
    call scrollToVisible() on it.

    Returns YES if an actual scroll took place, no otherwise.

    @returns {Boolean}
  */
  scrollToVisible: function() {
    var pv = this.get('parentView');
    while(pv && !pv.get('isScrollable')) { pv = pv.get('parentView'); }

    // found view, first make it scroll itself visible then scroll this.
    if (pv) {
      pv.scrollToVisible();
      return pv.scrollToVisible(this);
    } else {
      return NO ;
    }
  },

  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.

    @property {Rect}
    @test in layoutStyle
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null) ;
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidChange to check the frame for us

  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.

    This method is used especially by the scroll view to automatically
    calculate when scrollviews should be visible.

    Passing null for the parent dimensions will use the actual current
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.

    @param {Rect} pdim the projected parent dimensions
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function(pdim) {
    var layout = this.get('layout'),
        f = {} , error, layer, AUTO = SC.LAYOUT_AUTO,
        stLayout = this.get('useStaticLayout'),
        pv = this.get('parentView'),
        dH, dW, //shortHand for parentDimensions
        borderTop, borderLeft,
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW === AUTO && stLayout !== undefined && !stLayout) {
      error = SC.Error.desc(("%@.layout() cannot use width:auto if "+
                "staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
      console.error(error.toString()) ;
      throw error ;
    }

    if (lH === AUTO && stLayout !== undefined && !stLayout) {
       error = SC.Error.desc(("%@.layout() cannot use height:auto if "+
                "staticLayout is disabled").fmt(this),"%@".fmt(this), -1);
       console.error(error.toString())  ;
      throw error ;
    }

    if (stLayout) {
      // need layer to be able to compute rect
      if (layer = this.get('layer')) {
        f = SC.viewportOffset(layer); // x,y
        if (pv) { f = pv.convertFrameFromView(f, null); }

        /*
          TODO Can probably have some better width/height values - CC
          FIXME This will probably not work right with borders - PW
        */
        f.width = layer.offsetWidth;
        f.height = layer.offsetHeight;
        return f;
      }
      return null; // can't compute
    }


    if (!pdim) { pdim = this.computeParentDimensions(layout) ; }
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)){
        f.x = dW*lL;
      }else{
        f.x = lL ;
      }
      if (lW !== undefined) {
        if(lW === AUTO) { f.width = AUTO ; }
        else if(SC.isPercentage(lW)) { f.width = dW*lW ; }
        else { f.width = lW ; }
      } else { // better have lR!
        f.width = dW - f.x ;
        if(lR && SC.isPercentage(lR)) { f.width = f.width - (lR*dW) ; }
        else { f.width = f.width - (lR || 0) ; }
      }
    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (SC.isPercentage(lR)) {
          f.width = dW - (dW*lR) ;
        }
        else f.width = dW - lR ;
        f.x = 0 ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        else if(SC.isPercentage(lW)) f.width = dW*lW ;
        else f.width = (lW || 0) ;
        if (SC.isPercentage(lW)) f.x = dW - (lR*dW) - f.width ;
        else f.x = dW - lR - f.width ;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW === AUTO) f.width = AUTO ;
      else if (SC.isPercentage(lW)) f.width = lW*dW ;
      else f.width = (lW || 0) ;
      if(SC.isPercentage(lcX)) f.x = (dW - f.width)/2 + (lcX*dW) ;
      else f.x = (dW - f.width)/2 + lcX ;
    } else {
      f.x = 0 ; // fallback
      if (SC.none(lW)) {
        f.width = dW ;
      } else {
        if(lW === AUTO) f.width = AUTO ;
        if (SC.isPercentage(lW)) f.width = lW*dW ;
        else f.width = (lW || 0) ;
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) f.y = lT*dH ;
      else f.y = lT ;
      if (lH !== undefined) {
        if(lH === AUTO) f.height = AUTO ;
        else if(SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH ;
      } else { // better have lB!
        if(lB && SC.isPercentage(lB)) f.height = dH - f.y - (lB*dH) ;
        else f.height = dH - f.y - (lB || 0) ;
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (SC.isPercentage(lB)) f.height = dH - (lB*dH) ;
        else f.height = dH - lB ;
        f.y = 0 ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = (lH || 0) ;
        if (SC.isPercentage(lB)) f.y = dH - (lB*dH) - f.height ;
        else f.y = dH - lB - f.height ;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH === AUTO) f.height = AUTO ;
      if (lH && SC.isPercentage(lH)) f.height = lH*dH ;
      else f.height = (lH || 0) ;
      if (SC.isPercentage(lcY)) f.y = (dH - f.height)/2 + (lcY*dH) ;
      else f.y = (dH - f.height)/2 + lcY ;

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(lH)) {
        f.height = dH ;
      } else {
        if(lH === AUTO) f.height = AUTO ;
        if (SC.isPercentage(lH)) f.height = lH*dH ;
        else f.height = lH || 0 ;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if(f.height !== AUTO) f.height = Math.floor(f.height);
    if(f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    // views with SC.Border mixin applied applied
    if (this.get('hasBorder')) {
      borderTop = this.get('borderTop') || 0;
      borderLeft = this.get('borderLeft') || 0;
      f.height -= borderTop+ (this.get('borderBottom') || 0);
      f.y += borderTop;
      f.width -= borderLeft + (this.get('borderRight') || 0);
      f.x += borderLeft;
    }

    // Account for special cases inside ScrollView, where we adjust the
    // element's scrollTop/scrollLeft property for performance reasons.
    if (pv && pv.isScrollContainer) {
      pv = pv.get('parentView');
      f.x -= pv.get('horizontalScrollOffset');
      f.y -= pv.get('verticalScrollOffset');
    }

    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) {
      f.height = layout.maxHeight ;
    }

    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) {
      f.height = layout.minHeight ;
    }

    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) {
      f.width = layout.maxWidth ;
    }

    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) {
      f.width = layout.minWidth ;
    }

    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0 ;
    if (f.width < 0) f.width = 0 ;

    return f;
  },

  computeParentDimensions: function(frame) {
    var ret, pv = this.get('parentView'), pf = (pv) ? pv.get('frame') : null ;

    if (pf) {
      ret = { width: pf.width, height: pf.height };
    } else {
      var f = frame || {};
      ret = {
        width: (f.left || 0) + (f.width || 0) + (f.right || 0),
        height: (f.top || 0) + (f.height || 0) + (f.bottom || 0)
      };
    }
    return ret ;
  },

  /**
    The clipping frame returns the visible portion of the view, taking into
    account the contentClippingFrame of the parent view.  Keep in mind that
    the clippingFrame is in the context of the view itself, not it's parent
    view.

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's contentClippingFrame.

    @property {Rect}
  */
  clippingFrame: function() {
    var f = this.get('frame'),
        ret = f,
        pv, cf;

    if (!f) return null;
    pv = this.get('parentView');
    if (pv) {
      cf = pv.get('contentClippingFrame');
      if (!cf) return f;
      ret = SC.intersectRects(cf, f);
    }
    ret.x -= f.x;
    ret.y -= f.y;

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /**
    The clipping frame child views should intersect with.  Normally this is
    the same as the regular clippingFrame.  However, you may override this
    method if you want the child views to actually draw more or less content
    than is actually visible for some reason.

    Usually this is only used by the ScrollView to optimize drawing on touch
    devices.

    @property {Rect}
  */
  contentClippingFrame: function() {
    return this.get('clippingFrame');
  }.property('clippingFrame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_view_clippingFrameDidChange: function() {
    var cvs = this.get('childViews'), len = cvs.length, idx, cv ;
    for (idx=0; idx<len; ++idx) {
      cv = cvs[idx] ;

      // In SC 1.0 views with static layout did not receive notifications
      // of frame changes because they didn't support frames.  In SC 1.1 they
      // do support frames, so they should receive notifications.  Also in
      // SC 1.1 SC.StaticLayout is merged into SC.View.  The mixin is only
      // for compatibility.  This property is defined on the mixin.
      //
      // frame changes should be sent all the time unless this property is
      // present to indicate that we want the old 1.0 API behavior instead.
      //
      if (!cv.useStaticLayout) {
        cv.notifyPropertyChange('clippingFrame') ;
        cv._sc_view_clippingFrameDidChange();
      }
    }
  },

  /**
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.

    @returns {void}
    @test in viewDidResize
  */
  parentViewDidResize: function() {
    var frameMayHaveChanged, layout, isFixed, isPercentageFunc, isPercentage;

    // If this view uses static layout, our "do we think the frame changed?"
    // logic is not applicable and we simply have to assume that the frame may
    // have changed.
    if (this.useStaticLayout) {
      frameMayHaveChanged = YES;
    }
    else {
      layout = this.get('layout');

      // only resizes if the layout does something other than left/top - fixed
      // size.
      isFixed = (
        (layout.left !== undefined) && (layout.top !== undefined) &&
        (layout.width !== undefined) && (layout.height !== undefined)
      );


      // If it's fixed, our frame still could have changed if it's fixed to a
      // percentage of the parent.
      if (isFixed) {
        isPercentageFunc = SC.isPercentage;
        isPercentage = (isPercentageFunc(layout.left) ||
                        isPercentageFunc(layout.top) ||
                        isPercentageFunc(layout.width) ||
                        isPercentageFunc(layout.right) ||
                        isPercentageFunc(layout.centerX) ||
                        isPercentageFunc(layout.centerY));
      }

      frameMayHaveChanged = (!isFixed || isPercentage);
    }

    // Do we think there's a chance our frame will have changed as a result?
    if (frameMayHaveChanged) {
      // There's a chance our frame changed.  Invoke viewDidResize(), which
      // will notify about our change to 'frame' (if it actually changed) and
      // appropriately notify our child views.
      this.viewDidResize();
    }
  },



  /**
    This method is invoked on your view when the view resizes due to a layout
    change or potentially due to the parent view resizing (if your view’s size
    depends on the size of your parent view).  You can override this method
    to implement your own layout if you like, such as performing a grid
    layout.

    The default implementation simply notifies about the change to 'frame' and
    then calls parentViewDidResize on all of your children.

    @returns {void}
  */
  viewDidResize: function() {
    this._viewFrameDidChange();

    // Also notify our children.
    var cv = this.childViews, len, idx, view ;
    for (idx=0; idx<(len= cv.length); ++idx) {
      view = cv[idx];
      view.parentViewDidResize();
    }
  },

  /** @private
    Invoked by other views to notify this view that its frame has changed.

    This notifies the view that its frame property has changed,
    then propagates those changes to its child views.
  */
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
    this._sc_view_clippingFrameDidChange();
  },

  // Implementation note: As a general rule, paired method calls, such as
  // beginLiveResize/endLiveResize that are called recursively on the tree
  // should reverse the order when doing the final half of the call. This
  // ensures that the calls are propertly nested for any cleanup routines.
  //
  // -> View A.beginXXX()
  //   -> View B.beginXXX()
  //     -> View C.begitXXX()
  //   -> View D.beginXXX()
  //
  // ...later on, endXXX methods are called in reverse order of beginXXX...
  //
  //   <- View D.endXXX()
  //     <- View C.endXXX()
  //   <- View B.endXXX()
  // <- View A.endXXX()
  //
  // See the two methods below for an example implementation.

  /**
    Call this method when you plan to begin a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  beginLiveResize: function() {
    // call before children have been notified...
    if (this.willBeginLiveResize) this.willBeginLiveResize() ;

    // notify children in order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=0; idx<len; ++idx) {
      view = ary[idx] ;
      if (view.beginLiveResize) view.beginLiveResize();
    }
    return this ;
  },

  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.

    @returns {SC.View} receiver
    @test in viewDidResize
  */
  endLiveResize: function() {
    // notify children in *reverse* order
    var ary = this.get('childViews'), len = ary.length, idx, view ;
    for (idx=len-1; idx>=0; --idx) { // loop backwards
      view = ary[idx] ;
      if (view.endLiveResize) view.endLiveResize() ;
    }

    // call *after* all children have been notified...
    if (this.didEndLiveResize) this.didEndLiveResize() ;
    return this ;
  },

  /**
    The view responsible for laying out this view.  The default version
    returns the current parent view.
  */
  layoutView: function() {
    return this.get('parentView') ;
  }.property('parentView').cacheable(),

  /**
    This method is called whenever a property changes that invalidates the
    layout of the view.  Changing the layout will do this automatically, but
    you can add others if you want.

    Implementation Note:  In a traditional setup, we would simply observe
    'layout' here, but as described above in the documentation for our custom
    implementation of propertyDidChange(), this method must always run
    immediately after 'layout' is updated to avoid the potential for stale
    (incorrect) cached 'frame' values.

    @returns {SC.View} receiver
  */
  layoutDidChange: function() {
    // Did our layout change in a way that could cause us to be resized?  If
    // not, then there's no need to invalidate the frames of our child views.
    var previousLayout = this._previousLayout,
        currentLayout  = this.get('layout'),
        didResize      = YES,
        previousWidth, previousHeight, currentWidth, currentHeight;


    // Handle old style rotation
    if (!SC.none(currentLayout.rotate)) {
      if (SC.none(currentLayout.rotateX)) {
        currentLayout.rotateX = currentLayout.rotate;
        console.warn('Please set rotateX instead of rotate');
      }
    }
    if (!SC.none(currentLayout.rotateX)) {
      currentLayout.rotate = currentLayout.rotateX;
    } else {
      delete currentLayout.rotate;
    }

    var animations = currentLayout.animations;
    if (animations) {
      if (!SC.none(animations.rotate)) {
        if (SC.none(animations.rotateX)) {
          animations.rotateX = animations.rotate;
          console.warn('Please animate rotateX instead of rotate');
        }
      }
      if (!SC.none(animations.rotateX)) {
        animations.rotate = animations.rotateX;
      } else {
        delete animations.rotate;
      }
    }

    if (previousLayout  &&  previousLayout !== currentLayout) {
      // This is a simple check to see whether we think the view may have
      // resized.  We could look for a number of cases, but for now we'll
      // handle only one simple case:  if the width and height are both
      // specified, and they have not changed.
      previousWidth = previousLayout.width;
      if (previousWidth !== undefined) {
        currentWidth = currentLayout.width;
        if (previousWidth === currentWidth) {
          previousHeight = previousLayout.height;
          if (previousLayout !== undefined) {
            currentHeight = currentLayout.height;
            if (previousHeight === currentHeight) didResize = NO;
          }
        }
      }
    }

    this.beginPropertyChanges() ;
    this.notifyPropertyChange('hasAcceleratedLayer');
    this.notifyPropertyChange('layoutStyle') ;
    if (didResize) {
      this.viewDidResize();
    }
    else {
      // Even if we didn't resize, our frame might have changed.
      // viewDidResize() handles this in the other case.
      this._viewFrameDidChange();
    }
    this.endPropertyChanges() ;

    // notify layoutView...
    var layoutView = this.get('layoutView');
    if (layoutView) {
      layoutView.set('childViewsNeedLayout', YES);
      layoutView.layoutDidChangeFor(this) ;
      if (layoutView.get('childViewsNeedLayout')) {
        layoutView.invokeOnce(layoutView.layoutChildViewsIfNeeded);
      }
    }

    this._previousLayout = currentLayout;

    return this ;
  },

  /**
    This this property to YES whenever the view needs to layout its child
    views.  Normally this property is set automatically whenever the layout
    property for a child view changes.

    @property {Boolean}
  */
  childViewsNeedLayout: NO,

  /**
    One of two methods that are invoked whenever one of your childViews
    layout changes.  This method is invoked everytime a child view's layout
    changes to give you a chance to record the information about the view.

    Since this method may be called many times during a single run loop, you
    should keep this method pretty short.  The other method called when layout
    changes, layoutChildViews(), is invoked only once at the end of
    the run loop.  You should do any expensive operations (including changing
    a childView's actual layer) in this other method.

    Note that if as a result of running this method you decide that you do not
    need your layoutChildViews() method run later, you can set the
    childViewsNeedsLayout property to NO from this method and the layout
    method will not be called layer.

    @param {SC.View} childView the view whose layout has changed.
    @returns {void}
  */
  layoutDidChangeFor: function(childView) {
    var set = this._needLayoutViews ;
    if (!set) set = this._needLayoutViews = SC.CoreSet.create();
    set.add(childView);
  },

  /**
    Called your layout method if the view currently needs to layout some
    child views.

    @param {Boolean} isVisible if true assume view is visible even if it is not.
    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  layoutChildViewsIfNeeded: function(isVisible) {
    if (!isVisible) isVisible = this.get('isVisibleInWindow');
    if (isVisible && this.get('childViewsNeedLayout')) {
      this.set('childViewsNeedLayout', NO);
      this.layoutChildViews();
    }
    return this ;
  },

  /**
    Applies the current layout to the layer.  This method is usually only
    called once per runloop.  You can override this method to provide your
    own layout updating method if you want, though usually the better option
    is to override the layout method from the parent view.

    The default implementation of this method simply calls the renderLayout()
    method on the views that need layout.

    @returns {void}
  */
  layoutChildViews: function() {
    var set = this._needLayoutViews,
        len = set ? set.length : 0,
        i;
    for (i = 0; i < len; ++i) {
      set[i].updateLayout();
    }
    set.clear(); // reset & reuse
  },

  /**
    Invoked by the layoutChildViews method to update the layout on a
    particular view.  This method creates a render context and calls the
    renderLayout() method, which is probably what you want to override instead
    of this.

    You will not usually override this method, but you may call it if you
    implement layoutChildViews() in a view yourself.

    @returns {SC.View} receiver
    @test in layoutChildViews
  */
  updateLayout: function() {
    var layer = this.get('layer'), context;
    if (layer) {
      context = this.renderContext(layer);
      this.renderLayout(context, NO);
      context.update();

      // If this view uses static layout, then notify if the frame changed.
      // (viewDidResize will do a comparison)
      if (this.useStaticLayout) this.viewDidResize();
    }
    layer = null ;
    return this ;
  },

  /**
    Default method called by the layout view to actually apply the current
    layout to the layer.  The default implementation simply assigns the
    current layoutStyle to the layer.  This method is also called whenever
    the layer is first created.

    @param {SC.RenderContext} the render context
    @returns {void}
    @test in layoutChildViews
  */
  renderLayout: function(context, firstTime) {
    this.get('layoutStyleCalculator').willRenderAnimations();
    context.addStyle(this.get('layoutStyle'));
    this.get('layoutStyleCalculator').didRenderAnimations();
  },

  _renderLayerSettings: function(original, context, firstTime) {
    original(context, firstTime);
    this.renderLayout(context, firstTime);
  }.enhance()

});

SC.View.mixin(
  /** @scope SC.View */ {

  /**
    Convert any layout to a Top, Left, Width, Height layout
  */
  convertLayoutToAnchoredLayout: function(layout, parentFrame){
    var ret = {top: 0, left: 0, width: parentFrame.width, height: parentFrame.height},
        pFW = parentFrame.width, pFH = parentFrame.height, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    // X Conversion
    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if(SC.isPercentage(lL)) ret.left = lL*pFW;
      else ret.left = lL;
      if (lW !== undefined) {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else if(SC.isPercentage(lW)) ret.width = lW*pFW ;
        else ret.width = lW ;
      } else {
        if (lR && SC.isPercentage(lR)) ret.width = pFW - ret.left - (lR*pFW);
        else ret.width = pFW - ret.left - (lR || 0);
      }

    // handle right aligned
    } else if (!SC.none(lR)) {

      // if no width, calculate it from the parent frame
      if (SC.none(lW)) {
        ret.left = 0;
        if(lR && SC.isPercentage(lR)) ret.width = pFW - (lR*pFW);
        else ret.width = pFW - (lR || 0);

      // If has width, calculate the left anchor from the width and right and parent frame
      } else {
        if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lW)) ret.width = lW*pFW;
          else ret.width = lW;
          if (SC.isPercentage(lR)) ret.left = pFW - (ret.width + lR);
          else ret.left = pFW - (ret.width + lR);
        }
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if(lW && SC.isPercentage(lW)) ret.width = (lW*pFW) ;
      else ret.width = (lW || 0) ;
      ret.left = ((pFW - ret.width)/2);
      if (SC.isPercentage(lcX)) ret.left = ret.left + lcX*pFW;
      else ret.left = ret.left + lcX;

    // if width defined, assume left of zero
    } else if (!SC.none(lW)) {
      ret.left =  0;
      if(lW === SC.LAYOUT_AUTO) ret.width = SC.LAYOUT_AUTO ;
      else {
        if(SC.isPercentage(lW)) ret.width = lW*pFW;
        else ret.width = lW;
      }

    // fallback, full width.
    } else {
      ret.left = 0;
      ret.width = 0;
    }

    // handle min/max
    if (layout.minWidth !== undefined) ret.minWidth = layout.minWidth ;
    if (layout.maxWidth !== undefined) ret.maxWidth = layout.maxWidth ;

    // Y Conversion
    // handle left aligned and top/bottom
    if (!SC.none(lT)) {
      if(SC.isPercentage(lT)) ret.top = lT*pFH;
      else ret.top = lT;
      if (lH !== undefined) {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else if (SC.isPercentage(lH)) ret.height = lH*pFH;
        else ret.height = lH ;
      } else {
        ret.height = pFH - ret.top;
        if(lB && SC.isPercentage(lB)) ret.height = ret.height - (lB*pFH);
        else ret.height = ret.height - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {

      // if no height, calculate it from the parent frame
      if (SC.none(lH)) {
        ret.top = 0;
        if (lB && SC.isPercentage(lB)) ret.height = pFH - (lB*pFH);
        else ret.height = pFH - (lB || 0);

      // If has height, calculate the top anchor from the height and bottom and parent frame
      } else {
        if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
        else {
          if (SC.isPercentage(lH)) ret.height = lH*pFH;
          else ret.height = lH;
          ret.top = pFH - ret.height;
          if (SC.isPercentage(lB)) ret.top = ret.top - (lB*pFH);
          else ret.top = ret.top - lB;
        }
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if(lH && SC.isPercentage(lH)) ret.height = (lH*pFH) ;
      else ret.height = (lH || 0) ;
      ret.top = ((pFH - ret.height)/2);
      if(SC.isPercentage(lcY)) ret.top = ret.top + lcY*pFH;
      else ret.top = ret.top + lcY;

    // if height defined, assume top of zero
    } else if (!SC.none(lH)) {
      ret.top =  0;
      if(lH === SC.LAYOUT_AUTO) ret.height = SC.LAYOUT_AUTO ;
      else if (SC.isPercentage(lH)) ret.height = lH*pFH;
      else ret.height = lH;

    // fallback, full height.
    } else {
      ret.top = 0;
      ret.height = 0;
    }

    if(ret.top) ret.top = Math.floor(ret.top);
    if(ret.bottom) ret.bottom = Math.floor(ret.bottom);
    if(ret.left) ret.left = Math.floor(ret.left);
    if(ret.right) ret.right = Math.floor(ret.right);
    if(ret.width !== SC.LAYOUT_AUTO) ret.width = Math.floor(ret.width);
    if(ret.height !== SC.LAYOUT_AUTO) ret.height = Math.floor(ret.height);

    // handle min/max
    if (layout.minHeight !== undefined) ret.minHeight = layout.minHeight ;
    if (layout.maxHeight !== undefined) ret.maxHeight = layout.maxHeight ;

    return ret;
  },

  /**
    For now can only convert Top/Left/Width/Height to a Custom Layout
  */
  convertLayoutToCustomLayout: function(layout, layoutParams, parentFrame){
    // TODO: [EG] Create Top/Left/Width/Height to a Custom Layout conversion
  },

  applyAttributesToContext: function(original, context) {
    original(context);

    if (this.get('useStaticLayout')) { context.addClass('sc-static-layout'); }
    if (this.get('backgroundColor')) {
      context.css('backgroundColor', this.get('backgroundColor'));
    }
  }.enhance()
});
