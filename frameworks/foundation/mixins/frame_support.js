// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 

  Adds support for frames and clippingFrames to View classes.
  
  Normally view classes can set their size and positioning through the 
  'layout' property, but they don't keep track of the current geometry of the 
  view once it is set.  For many controls this is acceptable because 
  once you generate the HTML, the browser will take care of the size and 
  positioning of elements for you.
  
  Certain views, however, do need to have precise control over their own
  geometry such as collection views, split views, and some drop zones.  For 
  these views, you can add this extra mixin to provided the geometry 
  functionality you need.
  
  h2. Requirements
  
  For frame support to work properly, your view must follow a few conventions
  that are not required for general views.  Specifically:
  
  - The view must be absolutely positioned.  It is not necessary for child views to be absolutely positioned, however, unless they also include FrameSupport.
  - The view's parentView (and every parentView on up) must also include FrameSupport.
  
  Typically, these requirements should not be difficult to support since 
  absolute positioning is the default behavior for SC.View's anyway.  Using
  absolute positioning for views is sometimes controversial, but it delivers
  import performance benefits and allows the frame support provided by this 
  mixin to remain simple and accurate.
  
  @since SproutCore 1.0
*/
SC.FrameSupport = {

  /**
    Converts a frame from the receiver's offset to the target offset.  Both
    the receiver and the target must belong to the same pane.  If you pass
    null, the conversion will be to the pane level.
    
    Note the target view you choose must also include FrameSupport for this
    method to function.
    
    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
  */
  convertFrameToView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f;

    // walk up this side
    while(next = view.get('parentView')) {
      f = next.get('frame');
      myX += f.x; myY += f.y ;
      view = next ; 
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = next.get('frame'); targetX += f.x; targetY += f.y ;
        view = next ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x + myX - targetX ;
    myY = frame.y + myY - targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height };
  },

  /**
    Converts a clipping frame from the receiver's offset to the target offset. 
    Both the receiver and the target must belong to the same pane.  If you 
    pass null, the conversion will be to the pane level.

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
  */
  convertClippingFrameToView: function(clippingFrame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next = this, f;
    
    // walk up this side
    do {
      f = next.get('frame'); 
      myX += f.x; myY += f.y ;
      view = next ; 
    } while (next = view.get('parentView')) ;

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = next.get('frame'); targetX += f.x; targetY += f.y ;
        view = next ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = clippingFrame.x + myX - targetX ;
    myY = clippingFrame.y + myY - targetY ;
    return { x: myX, y: myY, width: clippingFrame.width, height: clippingFrame.height };
  },

  /**
    Converts a frame offset in the coordinates of another view system to 
    the reciever's view.

    @param {Rect} frame the source frame
    @param {SC.View} targetView the target view to convert to
    @returns {Rect} converted frame
  */
  convertFrameFromView: function(frame, targetView) {
    var myX=0, myY=0, targetX=0, targetY=0, view = this, next, f;

    // walk up this side
    while(next = view.get('parentView')) {
      f = view.get('frame'); myX += f.x; myY += f.y ;
      view = next ; 
    }

    // walk up other size
    if (targetView) {
      view = targetView ;
      while(next = view.get('parentView')) {
        f = view.get('frame'); targetX += f.x; targetY += f.y ;
        view = next ; 
      }
    }
    
    // now we can figure how to translate the origin.
    myX = frame.x - myX + targetX ;
    myY = frame.y - myY + targetY ;
    return { x: myX, y: myY, width: frame.width, height: frame.height };
  },
  
  /**
    Frame describes the current bounding rect for your view.  This is always
    measured from the top-left corner of the parent view.
    
    @property {Rect}
  */
  frame: function() {
    return this.computeFrameWithParentFrame(null);
  }.property('layout').cacheable(),
  
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
    var layout = this.get('layout') ;
    var f = {} ;

    // handle left aligned and left/right 
    if (!SC.none(layout.left)) {
      f.x = Math.floor(layout.left) ;
      if (layout.width !== undefined) {
        f.width = Math.floor(layout.width) ;
      } else { // better have layout.right!
        if (!pdim) pdim = this.computeParentDimensions(layout);
        f.width = Math.floor(pdim.width - f.x - (layout.right || 0)) ;
      }
      
    // handle right aligned
    } else if (!SC.none(layout.right)) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      if (SC.none(layout.width)) {
        f.width = pdim.width - layout.right ;
        f.x = 0;
      } else {
        f.width = Math.floor(layout.width || 0) ;
        f.x = Math.floor(pdim.width - layout.right - f.width) ;
      }

    // handle centered
    } else if (!SC.none(layout.centerX)) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.width = Math.floor(layout.width || 0);
      f.x = Math.floor((pdim.width - f.width)/2 + layout.centerX);
    } else {
      f.x = 0 ; // fallback
      if (SC.none(layout.width)) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.width = Math.floor(pdim.width) ;
      } else f.width = layout.width;
    }


    // handle top aligned and top/bottom 
    if (!SC.none(layout.top)) {
      f.y = Math.floor(layout.top) ;
      if (layout.height !== undefined) {
        f.height = Math.floor(layout.height) ;
      } else { // better have layout.bottm!
        if (!pdim) pdim = this.computeParentDimensions(layout);
        f.height = Math.floor(pdim.height - f.y - (layout.bottom || 0)) ;
      }
      
    // handle bottom aligned
    } else if (!SC.none(layout.bottom)) {
      if (!pdim) pdim = this.computeParentDimensions(layout);
      if (SC.none(layout.height)) {
        f.height = pdim.height - layout.bottom;
        f.y = 0;
      } else {
        f.height = Math.floor(layout.height || 0) ;
        f.y = Math.floor(pdim.height - layout.bottom - f.height) ;
      }

    // handle centered
    } else if (!SC.none(layout.centerY)) {
      if (!pdim) pdim = this.computeParentDimensions(layout); 
      f.height = Math.floor(layout.height || 0);
      f.y = Math.floor((pdim.height - f.height)/2 + layout.centerY);

    // fallback
    } else {
      f.y = 0 ; // fallback
      if (SC.none(layout.height)) {
        if (!pdim) pdim = this.computeParentDimensions(layout); 
        f.height = Math.floor(pdim.height) ;
      } else f.height = layout.height;
    }

    // make sure the width/height fix min/max...
    if (!SC.none(layout.maxHeight) && (f.height > layout.maxHeight)) f.height = layout.maxHeight;
    if (!SC.none(layout.minHeight) && (f.height < layout.minHeight)) f.height = layout.minHeight;
    if (!SC.none(layout.maxWidth) && (f.width > layout.maxWidth)) f.width = layout.maxWidth;
    if (!SC.none(layout.minWidth) && (f.width < layout.minWidth)) f.width = layout.minWidth;

    // make sure width/height are never < 0
    if (f.height < 0) f.height = 0;
    if (f.width < 0) f.width = 0;
    
    
    return f;
  },

  computeParentDimensions: function(frame) {
    var pv = this.get('parentView'), pframe = (pv) ? pv.get('frame') : null;
    return {
      width: ((pframe) ? pframe.width : ((frame.left||0)+(frame.width||0)+(frame.right||0))) || 0,
      height: ((pframe) ? pframe.height : ((frame.top||0)+(frame.height||0)+(frame.bottom||0))) || 0
    } ;
  },
  
  
  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  Keep in mind that the 
    clippingFrame is in the context of the view itself, not it's parent view.
    
    Normally this will be calculate based on the intersection of your own 
    clippingFrame and your parentView's clippingFrame.  SC.ClipView may also
    shift this by a certain amount.    
  */
  clippingFrame: function() {
    var pv= this.get('parentView'), f = this.get('frame'), ret = f ;
    if (pv) {
     pv = pv.get('clippingFrame');
     ret = SC.intersectRects(pv, f);
    }
    ret.x -= f.x; ret.y -= f.y;
    return ret ;
  }.property('parentView', 'frame').cacheable(),
  
  /** @private
    Whenever the clippingFrame changes, this observer will fire, notifying
    child views that their frames have also changed.
  */
  _view_clippingFrameDidChange: function() {
    this.get('childViews').invoke('notifyPropertyChange', 'clippingFrame');
  }.observes('clippingFrame'),
  
  /** 
    This method may be called on your view whenever the parent view resizes.

    The default version of this method will reset the frame and then call 
    viewDidResize().  You will not usually override this method, but you may
    override the viewDidResize() method.
  */
  parentViewDidResize: function() {
    var layout = this.get('layout') ;

    // only resizes if the layout does something other than left/top - fixed
    // size.
    var isFixed = (layout.left!==undefined) && (layout.top!==undefined) && (layout.width !== undefined) && (layout.height !== undefined);

    if (!isFixed) {
      this.notifyPropertyChange('frame') ;
      this.viewDidResize();
    }
  },
  
  /**
    Call this method when you plan to begin a live resize.  This will 
    notify the receiver view and any of its children that are interested
    that the resize is about to begin.
    
    @returns {SC.View} receiver
  */
  beginLiveResize: function() {
    if (this.viewWillStartLiveResize) this.viewWillStartLiveResize();
    var ary = this.get('childViews'), len = ary.length, idx, view;
    for (idx = 0; idx < len; idx++ ) {
      if ((view = ary[idx]).beginLiveResize) view.beginLiveResize();
    }
  },

  /**
    Call this method when you are finished with a live resize.  This will
    notify the receiver view and any of its children that are interested
    that the live resize has ended.
  */
  endLiveResize: function() {
    if (this.viewDidEndLiveResize) this.viewDidEndLiveResize();
    var ary = this.get('childViews'), len = ary.length, idx, view;
    for (idx = 0; idx < len; idx++ ) {
      if ((view = ary[idx]).endLiveResize) view.endLiveResize();
    }
  },

  /**
    This method is invoked on your view when the view resizes due to a layout
    change or due to the parent view resizing.  You can override this method
    to implement your own layout if you like, such as performing a grid 
    layout.
    
    The default implementation simply calls parentViewDidResize on all of
    your children.
  */
  viewDidResize: function() {
    var cv = this.childViews, len = cv.length, idx, view;
    for(idx=0;idx<len;idx++) {
      if ((view=cv[idx]).parentViewDidResize) view.parentViewDidResize();
    }
  }.observes('layout')
  
};