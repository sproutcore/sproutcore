// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/application/view') ;

SC.RESIZE_BOTH = 'resize-both' ;
SC.RESIZE_TOP_LEFT = 'resize-top-left' ;
SC.RESIZE_BOTTOM_RIGHT = 'resize-bottom-right' ;

/**
  @class
  
  FIXME: Docs are out of date.

  A split view is used to show views that the user can resize or collapse.
  To use the split view, you need to add a top left view followed by an
  instance of SC.SplitDividerView followed by a bottom right view.

  For example:

  {{{
    <% view :workspace_container, :class => 'workspace_container' do %>
      <% split_view :workspace, :class => 'sc-app-workspace', :direction => :vertical do %>
        <% view :top_view, :can_collapse => false, :min_thickness => 50 do %>
          <p>My top view</p>
        <% end %>
        <%= split_divider_view %>
        <% view :bottom_view, :collapse_at_thickness => 100 do %>
          <p>My bottom view</p>
        <% end %>
      <% end%>
    <% end %>
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
  
  @property {Number} minThickness The minimum thickness of the child view
  @property {Number} maxThickness The maximum thickness of the child view
  @property {Number} collapseAtThickness When the divider is dragged beyond
  the point where the thickness of this view would become less than the value
  of this property, then collapse the view.
  @property {Boolean} canCollapse Set to NO when you don't want the child view
  to collapse. Defaults to YES.
  @property {Boolean} isCollapsed YES if the child view is collapsed, NO
  otherwise.

  @extends SC.View

  @author Charles Jolley
  @author Lawrence Pit
  @author Erich Ocean
*/
SC.SplitView = SC.View.extend(
/** @scope SC.SplitView.prototype */ {

  styleClass: ['sc-split-view'],  

  childLayoutProperties: 'layoutDirection dividerThickness autoresizeBehavior'.w(),

  /**
    delegate for controlling split view behavior.
  */
  delegate: null,

  /**
    [RO] Direction of layout.  Must be SC.LAYOUT_HORIZONTAL || SC.LAYOUT_VERTICAL.
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,
  
  /**
    Set to NO to disable collapsing for all views.
  */
  canCollapseViews: YES,
  
  /*
    Configure which view(s) you want to autoresize when this split view's layout
    changes.
  */
  autoresizeBehavior: SC.RESIZE_BOTH,
  
  /**
    A number between 0.0 and 1.0 specify how much of the topLeftView should show
    at startup.
  */
  topLeftDefaultThickness: 0.5,
  
  /**
    Yes, we're a split view.
  */
  isSplitView: YES,
  
  // add default views
  topLeftView: SC.View,
  dividerView: SC.SplitDividerView,
  bottomRightView: SC.View,

  /**
    Used by split divider to decide if the view can be collapsed.
  */
  canCollapseView: function(view) {
    return this.invokeDelegateMethod(this.delegate, 'splitViewCanCollapse', this, view) ;
  },

  /**
    Returns the thickness for a given view.

    @param {SC.View} view the view to get.
    @returns the view with the width.
  */
  thicknessForView: function(view) {
    var direction = this.get('layoutDirection') ;
    var ret = view.get('frame') ;
    return (direction === SC.LAYOUT_HORIZONTAL) ? ret.width : ret.height ;
  },
  
  /**
    
  */
  init: function() {
    sc_super() ;
    this._split_needsFirstLayout = YES ;
  },
  
  createChildViews: function() {
    var childViews = [], view;
    var viewAry = ['topLeftView', 'dividerView', 'bottomRightView'], idx, len;
    
    for (idx=0, len=viewAry.length; idx<len; ++idx) {
      if (view = this.get(viewAry[idx])) {
        view = this[viewAry[idx]] = this.createChildView(view, { 
          rootElementPath: [idx] 
        }) ;
        childViews.push(view);
      }
    }
    
    this.set('childViews', childViews);
    return this; 
  },
  
  /**
    Layout the views.

    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will set up the views so
    that they can resize appropriately.
  */
  updateChildLayout: function() {
    // console.log('updateLayout');
    
    if (this._split_needsFirstLayout) {
      console.log('doing first updateLayout');
      this._split_needsFirstLayout = NO ;
      var direction = this.get('layoutDirection') ;
      var splitViewThickness = (direction == SC.LAYOUT_HORIZONTAL) ? this.get('frame').width : this.get('frame').height ;
      this._desiredTopLeftThickness = parseInt(splitViewThickness * (this.get('topLeftDefaultThickness') || 0.5)) ;
      
      // TODO: handle min and max sizing and collapse settings *grrr*
    }
    
    // console.log('this._desiredTopLeftThickness is %@'.fmt(this._desiredTopLeftThickness));
    
    var topLeftView = this.get('topLeftView') ;
    var bottomRightView = this.get('bottomRightView') ;
    var dividerView = this.get('dividerView') ;
    var direction = this.get('layoutDirection') ;
    var topLeftThickness = this._desiredTopLeftThickness ;
    var dividerThickness = this.get('dividerThickness') ;
    var splitViewThickness = (direction == SC.LAYOUT_HORIZONTAL) ? this.get('frame').width : this.get('frame').height ;
    var bottomRightThickness = splitViewThickness - dividerThickness - topLeftThickness ;
    var autoresizeBehavior = this.get('autoresizeBehavior') ;
    var layout ;
    var isCollapsed ;

    // top/left view
    isCollapsed = topLeftView.get('isCollapsed') || NO ;
    topLeftView.setIfChanged('isVisible', !isCollapsed) ;
    layout = topLeftView.get('layout');
    if (direction == SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.left = 0 ;
      layout.bottom = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          break ;
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
          break ;
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
    // console.log('topLeftView layout %@'.fmt($I(layout)));
    // console.log(topLeftView);
    topLeftView.set('layout', layout);

    // split divider view
    if (dividerView) {
      layout = dividerView.get('layout');
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
            break ;
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
            break ;
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
      // console.log('dividerView layout %@'.fmt($I(layout)));
      // console.log(dividerView);
      dividerView.set('layout', layout);
    }

    // bottom/right view
    isCollapsed = bottomRightView.get('isCollapsed') || NO ;
    bottomRightView.setIfChanged('isVisible', !isCollapsed) ;
    layout = bottomRightView.get('layout');
    if (direction == SC.LAYOUT_HORIZONTAL) {
      layout.top = 0 ;
      layout.bottom = 0 ;
      layout.right = 0 ;
      switch (autoresizeBehavior) {
        case SC.RESIZE_BOTH:
          throw "SC.RESIZE_BOTH is currently unsupported.";
          break ;
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
          break ;
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
    // console.log('bottomRightView layout %@'.fmt($I(layout)));
    // console.log(bottomRightView);
    bottomRightView.set('layout', layout);
    
    topLeftView.updateDisplayLayout();
    dividerView.updateDisplayLayout();
    bottomRightView.updateDisplayLayout();
  },
  
  updateDisplay: function() {
    // console.log('updateDisplay');
    // this.adjustLayout();
    if (this._inLiveResize) this._setCursorStyle() ;
  },

  /**
    Update the split view's layout based on mouse movement.
    
    Call this method in the mouseDragged: method of your thumb view. The split view
    will begin tracking the mouse and will update its own layout to reflect the movement 
    of the mouse. As a result, the position of your thumb view will also be updated.
    
    @returns {Boolean}
  */
  mouseDownInThumbView: function(evt, thumbView) {
    evt.mouseHandler = this ; // capture future mouse event
    
    console.log('mouseDownInThumbView');
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
    
    // we're not the source view of the mouseDown:, so we need to capture events manually to receive them
    // SC.RootResponder.responder.startCapturingMouseEvents(this) ;
    this.viewWillStartLiveResize() ;
    this._inLiveResize = YES ;
    
    // add DIV
    
    return YES ;
  },
  
  mouseDragged: function(evt) {
    // console.log('mouseDragged');
    var offset = (this._layoutDirection == SC.LAYOUT_HORIZONTAL) ? evt.pageX - this._mouseDownX : evt.pageY - this._mouseDownY ;
    this._updateTopLeftThickness(offset) ;
    return YES;
  },
  
  mouseUp: function(evt) {
    console.log('mouseUp');
    this._thumbView = null ; // avoid memory leaks
    this._inLiveResize = NO ;
    this.viewDidEndLiveResize() ;
    // SC.RootResponder.responder.stopCapturingMouseEvents() ;
    return YES ;
    // return NO ; // pretend we didn't handle the event so that doubleClick is called on thumb views
  },

  doubleClickInThumbView: function(evt, thumbView) {
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
      (view === this._topLeftView) ? this._topLeftViewThickness = 0 : this._bottomRightViewThickness = 0 ;
      // if however the splitview decided not to collapse, clear:
      if (!view.get("isCollapsed")) {
        this._uncollapsedThickness = null;
      }
    } else {
      // uncollapse to the last thickness in it's uncollapsed state
      // this._splitView.setThicknessForView(view, view._uncollapsedThickness) ;
      (view === this._topLeftView) ? this._topLeftViewThickness = this._uncollapsedThickness : this._bottomRightViewThickness = this._uncollapsedThickness ;
      view._uncollapsedThickness = null ;
    }
    this._setCursorStyle() ;
    return true ;
  },
  
  /** @private */
  _updateTopLeftThickness: function(offset) {
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
    
    if (max != null) thickness = Math.min(max, thickness) ;
    if (min != null) thickness = Math.max(min, thickness) ;

    // constrain to thickness set on bottom/right
    max = this.get('bottomRightMaxThickness') ;
    min = this.get('bottomRightMinThickness') ;
    bottomRightThickness = maxAvailable - thickness ;
    if (max != null) bottomRightThickness = Math.min(max, bottomRightThickness) ;
    if (min != null) bottomRightThickness = Math.max(min, bottomRightThickness) ;
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
    brCollapseAtThickness = (brCollapseAtThickness == null) ? maxAvailable : (maxAvailable - brCollapseAtThickness);

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
      topLeftView.set('isCollapsed', thickness == 0) ;
      bottomRightView.set('isCollapsed', thickness >= maxAvailable) ;
      
      // this.set('displayNeedsUpdate', YES);
      // this.adjustLayout();
      this.childLayoutDidChange(); // updates child layouts
      this.displayDidChange(); // updates cursor
    }
  },

  /** @private */
  _setCursorStyle: function() {
    var topLeftView = this._topLeftView ;
    var bottomRightView = this._bottomRightView ;
 
    // updates the cursor of the thumb view that called mouseDownInThumbView() to reflect the status of the drag
    var tlThickness = this.thicknessForView(topLeftView) ;
    var brThickness = this.thicknessForView(bottomRightView) ;
    if (topLeftView.get('isCollapsed') || tlThickness == topLeftView.get("minThickness") || brThickness == bottomRightView.get("maxThickness")) {
      this._thumbView.$().css('cursor', this._layoutDirection == SC.HORIZONTAL ? "e-resize" : "s-resize" ) ;
    } else if (bottomRightView.get('isCollapsed') || tlThickness == topLeftView.get("maxThickness") || brThickness == bottomRightView.get("minThickness")) {
      this._thumbView.$().css('cursor', this._layoutDirection == SC.HORIZONTAL ? "w-resize" : "n-resize" ) ;
    } else {
      this._thumbView.$().css('cursor', this._layoutDirection == SC.HORIZONTAL ? "ew-resize" : "ns-resize" ) ;
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
    return proposedThickness;
  }

}) ;
