// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/split_divider');

SC.RESIZE_BOTH = 'resize-both' ;
SC.RESIZE_TOP_LEFT = 'resize-top-left' ;
SC.RESIZE_BOTTOM_RIGHT = 'resize-bottom-right' ;

/**
  @class
  
  A split view is used to show views that the user can resize or collapse.
  To use a split view you need to set a topLeftView, a bottomRightView and,
  optionally, a splitDividerView.  You can also set various other properties
  to control the minimum and maximum thickness allowed for the flexible views.
  
  h2. Example
  
  {{{
    SC.SplitView.design({
      
      // the left view...
      topLeftView: SC.View.design({
        // view contents
      }),
      
      // the right view
      bottomRightView: SC.View.design({
        // view contents
      })
      
    })
  }}}
  
  When the user clicks and drags on a split divider view, it will
  automatically resize the views immediately before and after the split
  divider view. You can constrain the resizing allowed by the split view
  either by setting a minThickness and maxThickness property on the views
  themselves or by implementing the method splitViewConstrainThickness on
  a delegate object.
  
  In addition to resizing views, users can also collapse views by double
  clicking on a split divider view.  When a view is collapsed, it's isVisible
  property is set to NO and its space it removed from the view.  Double
  clicking on a divider again will restore a collapsed view.  A user can also
  start to drag the divider to show the collapsed view.
  
  You can programmatically control collapsing behavior using various properties
  on either the split view or its child views, and/or by implementing the
  method splitViewCanCollapse on a delegate object.
  
  Finally, SplitViews can layout their child views either horizontally or
  vertically.  To choose the direction of layout set the layoutDirection
  property on the view (or the :direction option with the view helper).
  This property should be set when the view is created. Changing it
  dynamically will have an unknown effect.
  
  @property {Boolean} layoutDirection Either SC.HORIZONTAL or SC.VERTICAL.
  Defaults to SC.HORIZONTAL. Use the :direction option with the split_view
  viewhelper.
  
  @property {Boolean} canCollapseViews Set to NO when you don't want any of
  the child views to collapse. Defaults to YES. Use the :can_collapse_views
  option with the split_view viewhelper.
  
  In addition, the top/left and bottom/right child views can have these
  properties:
  
  @extends SC.View
  @since SproutCore 1.0
  
  @author Charles Jolley
  @author Lawrence Pit
  @author Erich Ocean
*/
SC.SplitView = SC.View.extend(
/** @scope SC.SplitView.prototype */ {
  
  classNames: ['sc-split-view'],
  
  childLayoutProperties: 'layoutDirection dividerThickness autoresizeBehavior'.w(),
  
  displayProperties: ['layoutDirection'],
  
  /**
    delegate for controlling split view behavior.
  */
  delegate: null,
  
  /**
    Direction of layout.  Must be SC.LAYOUT_HORIZONTAL or SC.LAYOUT_VERTICAL.
    
    @property {String}
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  /**
    Set to NO to disable collapsing for all views.
  */
  canCollapseViews: YES,
  
  /*
    Configure which view(s) you want to autoresize when this split view's 
    layout changes.  Possible options are:
    
    | SC.RESIZE_BOTTOM_RIGHT | (default) resizes bottomRightView |
    | SC.RESIZE_TOP_LEFT | resized topLeftView |
    
  */
  autoresizeBehavior: SC.RESIZE_BOTTOM_RIGHT,
  
  /**
    Specifies how much space the fixed view should use when the view is setup.
    A number less than one will be treated as a percentage, while a number 
    greater than one will be treated as a pixel width.
    
    The thickness will be applied to the opposite view defined by autoresizeBehavior.
    
    @property {Number}
  */
  defaultThickness: 0.5,
  
  /**
    Yes, we're a split view.
  */
  isSplitView: YES,
  
  // add default views
  topLeftView: SC.View,
  dividerView: SC.SplitDividerView,
  bottomRightView: SC.View,
  
  /**
    @property {SC.Cursor} the cursor thumb view should use for themselves
  */
  thumbViewCursor: null,
  
  /**
    Used by split divider to decide if the view can be collapsed.
  */
  canCollapseView: function(view) {
    // console.log('%@.canCollapseView(%@)'.fmt(this, view));
    return this.invokeDelegateMethod(this.delegate, 'splitViewCanCollapse', this, view) ;
  },
  
  /**
    Returns the thickness for a given view.
    
    @param {SC.View} view the view to get.
    @returns the view with the width.
  */
  thicknessForView: function(view) {
    // console.log('%@.thicknessForView(%@)'.fmt(this, view));
    var direction = this.get('layoutDirection') ;
    var ret = view.get('frame') ;
    return (direction === SC.LAYOUT_HORIZONTAL) ? ret.width : ret.height ;
  },
  
  createChildViews: function() {
    // console.log('%@.createChildViews()'.fmt(this));
    var childViews = [] ;
    var viewAry = ['topLeftView', 'dividerView', 'bottomRightView'] ;
    var view, idx, len ;
    
    for (idx=0, len=viewAry.length; idx<len; ++idx) {
      if (view = this.get(viewAry[idx])) {
        view = this[viewAry[idx]] = this.createChildView(view, {
          layoutView: this,
          rootElementPath: [idx]
        }) ;
        childViews.push(view) ;
      }
    }
    
    this.set('childViews', childViews) ;
    return this ; 
  },
  
  /**
    Layout the views.
    
    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will set up the views so
    that they can resize appropriately.
  */
  updateChildLayout: function() {
    // console.log('%@.updateChildLayout()'.fmt(this));
    var topLeftView = this.get('topLeftView') ;
    var bottomRightView = this.get('bottomRightView') ;
    var dividerView = this.get('dividerView') ;
    var direction = this.get('layoutDirection') ;
    var topLeftThickness = this._desiredTopLeftThickness ;
    var dividerThickness = this.get('dividerThickness') || 7 ;
    var splitViewThickness = (direction == SC.LAYOUT_HORIZONTAL) ? this.get('frame').width : this.get('frame').height ;
    var bottomRightThickness = splitViewThickness - dividerThickness - topLeftThickness ;
    var autoresizeBehavior = this.get('autoresizeBehavior') ;
    var layout ;
    var isCollapsed ;
    
    // console.log('topLeftThickness == %@'.fmt(topLeftThickness));
    // console.log('dividerThickness == %@'.fmt(dividerThickness));
    // console.log('splitViewThickness == %@'.fmt(splitViewThickness));
    // console.log('bottomRightThickness == %@'.fmt(bottomRightThickness));
    
    // top/left view
    isCollapsed = topLeftView.get('isCollapsed') || NO ;
    topLeftView.setIfChanged('isVisible', !isCollapsed) ;
    layout = SC.clone(topLeftView.get('layout'));
    if (direction == SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.left = 0 ;
      layout.bottom = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.right = bottomRightThickness + dividerThickness ;
          delete layout.width ;
          break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          delete layout.right ;
          layout.width = topLeftThickness ;
          break ;
      }
    } else {
      layout.top = 0;
      layout.left = 0 ;
      layout.right = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
        case SC.RESIZE_TOP_LEFT:
          layout.bottom = bottomRightThickness + dividerThickness ;
          delete layout.height ;
          break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          delete layout.bottom ;
          layout.height = topLeftThickness ;
          break ;
      }
    }
    // console.log('topLeftView layout %@'.fmt(SC.inspect(layout)));
    // console.log(topLeftView);
    topLeftView.set('layout', layout);
    
    // split divider view
    if (dividerView) {
      layout = SC.clone(dividerView.get('layout'));
      if (direction == SC.LAYOUT_HORIZONTAL) {
        layout.width = dividerThickness;
        delete layout.height ;
        layout.top = 0 ;
        layout.bottom = 0 ;
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.left ;
            // delete layout.right ;
            // layout.centerX = topLeftThickness + (dividerThickness / 2) ;
            // delete layout.centerY ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            delete layout.left ;
            layout.right = bottomRightThickness ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.left = topLeftThickness ;
            delete layout.right ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
        }
      } else {
        // console.log('setting vertical divider layout');
        // console.log('autoresizeBehavior is %@'.fmt(autoresizeBehavior));
        delete layout.width ;
        layout.height = dividerThickness ;
        layout.left = 0 ;
        layout.right = 0 ;
        switch (autoresizeBehavior) {
          case SC.RESIZE_BOTH:
            throw "SC.RESIZE_BOTH is currently unsupported.";
            // delete layout.top ;
            // delete layout.bottom ;
            // delete layout.centerX ;
            // layout.centerY = topLeftThickness + (dividerThickness / 2) ;
            //break ;
          case SC.RESIZE_TOP_LEFT:
            delete layout.top ;
            layout.bottom = bottomRightThickness ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
          case SC.RESIZE_BOTTOM_RIGHT:
            layout.top = topLeftThickness ;
            delete layout.bottom ;
            delete layout.centerX ;
            delete layout.centerY ;
            break ;
        }
      }
      // console.log('dividerView layout %@'.fmt(SC.inspect(layout)));
      // console.log(dividerView);
      dividerView.set('layout', layout);
    }
    
    // bottom/right view
    isCollapsed = bottomRightView.get('isCollapsed') || NO ;
    bottomRightView.setIfChanged('isVisible', !isCollapsed) ;
    layout = SC.clone(bottomRightView.get('layout'));
    if (direction == SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.bottom = 0 ;
      layout.right = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          //break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.left = topLeftThickness + dividerThickness ;
          delete layout.width ;
          break ;
        case SC.RESIZE_TOP_LEFT:
          delete layout.left ;
          layout.width = bottomRightThickness ;
          break ;
      }
    } else {
      layout.left = 0 ;
      layout.right = 0 ;
      layout.bottom = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          //break ;
        case SC.RESIZE_BOTTOM_RIGHT:
          layout.top = topLeftThickness + dividerThickness ;
          delete layout.height ;
          break ;
        case SC.RESIZE_TOP_LEFT:
          delete layout.top ;
          layout.height = bottomRightThickness ;
          break ;
      }
    }
    // console.log('bottomRightView layout %@'.fmt(SC.inspect(layout)));
    // console.log(bottomRightView);
    bottomRightView.set('layout', layout);
    
    // topLeftView.updateDisplayLayout();
    // dividerView.updateDisplayLayout();
    // bottomRightView.updateDisplayLayout();
  },
  
  /** @private */
  renderLayout: function(context, firstTime) {
    // console.log('%@.renderLayout(%@, %@)'.fmt(this, context, firstTime));
    // console.log('%@.frame = %@'.fmt(this, SC.inspect(this.get('frame'))));
    if (firstTime) {
      if (!this.get('thumbViewCursor')) {
        this.set('thumbViewCursor', SC.Cursor.create()) ;
      }
      
      var layoutDirection = this.get('layoutDirection') ;
      var splitViewThickness = (layoutDirection == SC.LAYOUT_HORIZONTAL) ? this.get('frame').width : this.get('frame').height ;
      var desiredThickness = this.get('defaultThickness') ;
      var autoResizeBehavior = this.get('autoresizeBehavior') ;
      
      // if default thickness is < 1, convert from percentage to absolute
      if (SC.none(desiredThickness) || (desiredThickness > 0 && desiredThickness < 1)) {
        desiredThickness =  Math.floor(splitViewThickness * (desiredThickness || 0.5)) ;
      }
      if (autoResizeBehavior === SC.RESIZE_BOTTOM_RIGHT) {
        this._desiredTopLeftThickness = desiredThickness ;
      } else { // (autoResizeBehavior === SC.RESIZE_TOP_LEFT)
        var dividerThickness = this.get('dividerThickness') || 7 ;
        this._desiredTopLeftThickness =  splitViewThickness - dividerThickness - desiredThickness ;
      }
      
      // make sure we don't exceed our min and max values, and that collapse 
      // settings are respected
      // cached values are required by _updateTopLeftThickness() below...
      this._topLeftView = this.get('topLeftView') ;
      this._bottomRightView = this.get('bottomRightView') ;
      this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
      this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
      this._dividerThickness = this.get('dividerThickness') ;
      this._layoutDirection = this.get('layoutDirection') ;
      
      // this handles min-max settings and collapse parameters
      this._updateTopLeftThickness(0) ;
      
      // update the cursor used by thumb views
      this._setCursorStyle() ;
      
      // actually set layout for our child views
      this.updateChildLayout() ;
    }
    sc_super() ;
  },
  
  /** @private */
  render: function(context, firstTime) {
    // console.log('%@.render(%@, %@)'.fmt(this, context, firstTime));
    // console.log('%@.frame = %@'.fmt(this, SC.inspect(this.get('frame'))));
    sc_super() ;
    
    if (this._inLiveResize) this._setCursorStyle() ;
    
    if (firstTime) {
      var dir = this.get('layoutDirection') ;
      if (dir===SC.LAYOUT_HORIZONTAL) context.addClass('sc-horizontal') ;
      else context.addClass('sc-vertical') ;
    }
  },
  
  // layoutDidChangeFor: function(childView) {
  //   // console.log('%@.layoutChildViews(%@)'.fmt(this, childView));
  //   sc_super() ;
  // },
  // 
  // layoutChildViews: function() {
  //   // console.log('%@.layoutChildViews()'.fmt(this));
  //   sc_super() ;
  // },
  
  /**
    Update the split view's layout based on mouse movement.
    
    Call this method in the mouseDown: method of your thumb view. The split view
    will begin tracking the mouse and will update its own layout to reflect the movement 
    of the mouse. As a result, the position of your thumb view will also be updated.
    
    @returns {Boolean}
  */
  mouseDownInThumbView: function(evt, thumbView) {
    // console.log('%@.mouseDownInThumbView(%@, %@)'.fmt(this, evt, thumbView));
    // console.log(evt.originalEvent);
    var responder = this.getPath('pane.rootResponder') ;
    if (!responder) return NO ; // nothing to do
      
    // we're not the source view of the mouseDown:, so we need to capture events manually to receive them
    responder.dragDidStart(this) ;
    
    // cache for later
    this._mouseDownX = evt.pageX ;
    this._mouseDownY = evt.pageY ;
    this._thumbView = thumbView ;
    this._topLeftView = this.get('topLeftView') ;
    this._bottomRightView = this.get('bottomRightView') ;
    this._topLeftViewThickness = this.thicknessForView(this.get('topLeftView'));
    this._bottomRightThickness = this.thicknessForView(this.get('bottomRightView'));
    this._dividerThickness = this.get('dividerThickness') ;
    this._layoutDirection = this.get('layoutDirection') ;
    
    this.beginLiveResize() ;
    this._inLiveResize = YES ;
    
    return YES ;
  },
  
  mouseDragged: function(evt) {
    // console.log('%@.mouseDragged(%@)'.fmt(this, evt));
    // console.log(evt.originalEvent);
    var offset = (this._layoutDirection == SC.LAYOUT_HORIZONTAL) ? evt.pageX - this._mouseDownX : evt.pageY - this._mouseDownY ;
    this._updateTopLeftThickness(offset) ;
    return YES;
  },
  
  mouseUp: function(evt) {
    // console.log('%@.mouseUp(%@, %@)'.fmt(this, evt));
    // console.log(evt.originalEvent);
    this._thumbView = null ; // avoid memory leaks
    this._inLiveResize = NO ;
    this.endLiveResize() ;
    return YES ;
  },
  
  doubleClickInThumbView: function(evt, thumbView) {
    // console.log('%@.mouseDragged(%@, %@)'.fmt(this, evt, thumbView));
    // console.log(evt.originalEvent);
    var view = this._topLeftView ;
    var isCollapsed = view.get('isCollapsed') || NO ;
    if (!isCollapsed && !this.canCollapseView(view)) {
      view = this._bottomRightView ;
      isCollapsed = view.get('isCollapsed') || NO ;
      if (!isCollapsed && !this.canCollapseView(view)) return NO;
    }
    
    if (!isCollapsed) {
      // remember thickness in it's uncollapsed state
      this._uncollapsedThickness = this.getThicknessForView(view)  ;
      // and collapse
      // this.setThicknessForView(view, 0) ;
      if (view === this._topLeftView) {
        this._topLeftViewThickness = 0 ;
      } else {
        this._bottomRightViewThickness = 0 ;
      }
      
      // if however the splitview decided not to collapse, clear:
      if (!view.get("isCollapsed")) {
        this._uncollapsedThickness = null;
      }
    } else {
      // uncollapse to the last thickness in it's uncollapsed state
      if (view === this._topLeftView) {
        this._topLeftViewThickness = this._uncollapsedThickness ;
      } else {
        this._bottomRightViewThickness = this._uncollapsedThickness ;
      }
      view._uncollapsedThickness = null ;
    }
    this._setCursorStyle() ;
    return true ;
  },
  
  /** @private */
  _updateTopLeftThickness: function(offset) {
    // console.log('%@._updateTopLeftThickness(%@)'.fmt(this, offset));
    // console.log('%@.frame = %@'.fmt(this, SC.inspect(this.get('frame'))));
    var topLeftView = this._topLeftView ;
    var bottomRightView = this._bottomRightView ;
    var topLeftViewThickness = this.thicknessForView(topLeftView); // the current thickness, not the original thickness
    var bottomRightViewThickness = this.thicknessForView(bottomRightView);
    
    var minAvailable = this._dividerThickness ;
    var maxAvailable = 0;
    if (!topLeftView.get("isCollapsed")) maxAvailable += topLeftViewThickness ;
    if (!bottomRightView.get("isCollapsed")) maxAvailable += bottomRightViewThickness ;
    
    var proposedThickness = this._topLeftViewThickness + offset;
    var direction = this._layoutDirection ;
    var bottomRightCanCollapse = this.canCollapseView(bottomRightView);
    
    var thickness = proposedThickness;
    
    // constrain to thickness set on top/left
    var max = this.get('topLeftMaxThickness') ;
    var min = this.get('topLeftMinThickness') ;
    
    if (!SC.none(max)) thickness = Math.min(max, thickness) ;
    if (!SC.none(min)) thickness = Math.max(min, thickness) ;
    
    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness') ;
    min = this.get('bottomRightMinThickness') ;
    var bottomRightThickness = maxAvailable - thickness ;
    if (!SC.none(max)) bottomRightThickness = Math.min(max, bottomRightThickness) ;
    if (!SC.none(min)) bottomRightThickness = Math.max(min, bottomRightThickness) ;
    thickness = maxAvailable - bottomRightThickness ;
    
    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainThickness', this, topLeftView, thickness) ;
    
    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable) ;
    
    // cannot be less than zero
    thickness = Math.max(0, thickness) ;
    
    var tlCollapseAtThickness = topLeftView.get('collapseAtThickness') ;
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0 ;
    var brCollapseAtThickness = bottomRightView.get('collapseAtThickness') ;
    brCollapseAtThickness = SC.none(brCollapseAtThickness) ? maxAvailable : (maxAvailable - brCollapseAtThickness);
    
    if ((proposedThickness <= tlCollapseAtThickness) && this.canCollapseView(topLeftView)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = bottomRightView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0 ;
      }
    } else if (proposedThickness >= brCollapseAtThickness && this.canCollapseView(bottomRightView)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = topLeftView.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }
    
    // now apply constrained value
    if (thickness != this.thicknessForView(topLeftView)) {
      this._desiredTopLeftThickness = thickness ;
      
      // un-collapse if needed.
      topLeftView.set('isCollapsed', thickness === 0) ;
      bottomRightView.set('isCollapsed', thickness >= maxAvailable) ;
      
      // this.set('displayNeedsUpdate', YES);
      // this.adjustLayout();
      this.updateChildLayout(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },
  
  /** @private */
  _setCursorStyle: function() {
    // console.log('%@._setCursorStyle()'.fmt(this));
    var topLeftView = this._topLeftView ;
    var bottomRightView = this._bottomRightView ;
    var thumbViewCursor = this.get('thumbViewCursor') ;
    
    // updates the cursor of the thumb view that called mouseDownInThumbView() to reflect the status of the drag
    var tlThickness = this.thicknessForView(topLeftView) ;
    var brThickness = this.thicknessForView(bottomRightView) ;
    if (topLeftView.get('isCollapsed') || tlThickness == this.get("topLeftMinThickness") || brThickness == this.get("bottomRightMaxThickness")) {
      thumbViewCursor.set('cursorStyle', this._layoutDirection == SC.LAYOUT_HORIZONTAL ? "e-resize" : "s-resize") ;
    } else if (bottomRightView.get('isCollapsed') || tlThickness == this.get("topLeftMaxThickness") || brThickness == this.get("bottomRightMinThickness")) {
      thumbViewCursor.set('cursorStyle', this._layoutDirection == SC.LAYOUT_HORIZONTAL ? "w-resize" : "n-resize") ;
    } else {
      thumbViewCursor.set('cursorStyle', this._layoutDirection == SC.LAYOUT_HORIZONTAL ? "ew-resize" : "ns-resize") ;
    }
  },
  
  /**
    (DELEGATE) Control whether a view can be collapsed.
    
    The default implemention returns NO if the split view property
    canCollapseViews is set to NO or when the given view has
    property canCollapse set to NO, otherwise it returns YES.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view we want to collapse.
    @returns {Boolean} YES to allow collapse.
  */
  splitViewCanCollapse: function(splitView, view) {
    // console.log('%@.splitViewCanCollapse(%@, %@)'.fmt(this, splitView, view));
    if (splitView.get('canCollapseViews') === NO) return NO ;
    if (view.get('canCollapse') === NO) return NO ;
    return YES ;
  },
  
  /**
    (DELEGATE) Constrain a views allowed thickness.
    
    The default implementation allows any thickness.  The view will
    automatically constrain the view to not allow views to overflow the
    visible area.
    
    @param {SC.SplitView} splitView the split view
    @param {SC.View} view the view in question
    @param {Number} proposedThickness the proposed thickness.
    @returns the allowed thickness
  */
  splitViewConstrainThickness: function(splitView, view, proposedThickness) {
    // console.log('%@.splitViewConstrainThickness(%@, %@, %@)'.fmt(this, splitView, view, proposedThickness));
    return proposedThickness;
  }

});
