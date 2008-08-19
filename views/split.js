// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/delegate_support');

SC.HORIZONTAL = 'horizontal' ;
SC.VERTICAL = 'vertical' ;

/**
  @class

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
  @extends SC.DelegateSupport

  @author Charles Jolley
  @author Lawrence Pit
*/
SC.SplitView = SC.View.extend(SC.DelegateSupport,
/** @scope SC.SplitView.prototype */ {

  emptyElement: '<div class="sc-split-view"></div>',

  /**
    delegate for controlling split view behavior.
  */
  delegate: null,

  /**
    Direction of layout.  Must be SC.HORIZONTAL || SC.VERTICAL.
  */
  layoutDirection: SC.HORIZONTAL,

  /**
    Set to NO to disable collapsing for all views.
  */
  canCollapseViews: YES,

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
  getThicknessForView: function(view) {
    var direction = this.get('layoutDirection') ;
    var ret = view.get('frame') ;
    return (direction === SC.HORIZONTAL) ? ret.width : ret.height ;
  },

  /**
    Sets the thickness of the named view and then lays out the rest of the
    views.

    @param {SC.View} view the view to adjust. Must not be a divider.
    @param {Number} proposedThickness the new desired thickness
    @returns the actual thickness
  */
  setThicknessForView: function(view, proposedThickness) {
    if (view.get('parentNode') != this) {
      throw "view must belong to receiver (view: %@)".fmt(view);
    }

    var views = this.get('childNodes') ;
    var tl_view = views[0] ;  // top/left view
    var br_view = views[2] ;  // bottom/right view
    var tl_view_thickness = this.getThicknessForView(tl_view);
    var br_view_thickness = this.getThicknessForView(br_view);

    var minAvailable = this.getThicknessForView(views[1]) ;  // thickness of divider
    var maxAvailable = 0;
    if (!tl_view.get("isCollapsed")) maxAvailable += this.getThicknessForView(tl_view) ;
    if (!br_view.get("isCollapsed")) maxAvailable += this.getThicknessForView(br_view) ;

    if (view == br_view) {
      proposedThickness = maxAvailable - proposedThickness ;
      view = tl_view ;
    } else if (view != tl_view) {
      throw "You can only set the thickness for the top/left or bottom/right views"
    }

    var thickness = proposedThickness;
    var direction = this.get('layoutDirection') ;
    var bottomRightCanCollapse = this.canCollapseView(br_view);

    // constrain to thickness set on top/left
    var max = tl_view.get('maxThickness') ;
    var min = tl_view.get('minThickness') ;
    if (max != null) thickness = Math.min(max, thickness) ;
    if (min != null) thickness = Math.max(min, thickness) ;

    // constrain to thickness set on bottom/right
    max = br_view.get('maxThickness') ;
    min = br_view.get('minThickness') ;
    bottomRightThickness = maxAvailable - thickness ;
    if (max != null) bottomRightThickness = Math.min(max, bottomRightThickness) ;
    if (min != null) bottomRightThickness = Math.max(min, bottomRightThickness) ;
    thickness = maxAvailable - bottomRightThickness ;

    // constrain to thickness determined by delegate.
    thickness = this.invokeDelegateMethod(this.delegate, 'splitViewConstrainThickness', this, tl_view, thickness) ;

    // cannot be more than what's available
    thickness = Math.min(thickness, maxAvailable) ;

    // cannot be less than zero
    thickness = Math.max(0, thickness) ;

    var tlCollapseAtThickness = tl_view.get('collapseAtThickness') ;
    if (!tlCollapseAtThickness) tlCollapseAtThickness = 0 ;
    var brCollapseAtThickness = br_view.get('collapseAtThickness') ;
    brCollapseAtThickness = (brCollapseAtThickness == null) ? maxAvailable : (maxAvailable - brCollapseAtThickness);

    if ((proposedThickness <= tlCollapseAtThickness) && this.canCollapseView(tl_view)) {
      // want to collapse top/left, check if this doesn't violate the max thickness of bottom/right
      max = br_view.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse top/left view, even if it has a minThickness
        thickness = 0 ;
      }
    } else if (proposedThickness >= brCollapseAtThickness && this.canCollapseView(br_view)) {
      // want to collapse bottom/right, check if this doesn't violate the max thickness of top/left
      max = tl_view.get('maxThickness');
      if (!max || (minAvailable + maxAvailable) <= max) {
        // collapse bottom/right view, even if it has a minThickness
        thickness = maxAvailable;
      }
    }

    // now apply constrained value
    if (thickness != this.getThicknessForView(tl_view)) {

      // un-collapse if needed.
      tl_view.set('isCollapsed', thickness == 0) ;
      br_view.set('isCollapsed', thickness >= maxAvailable) ;

      // set new frame
      var f = (direction === SC.HORIZONTAL) ? { width: thickness } : { height: thickness } ;
      tl_view.set('frame', f) ;

      // and layout
      this.layout() ;
    }
  },



  /**
    Layout the views.

    This method needs to be called anytime you change the view thicknesses
    to make sure they are arranged properly.  This will setup the views so
    that they can resize appropriately.
  */
  layout: function() {
    var views = this.get('childNodes') ;
    var topLeftThickness = this.getThicknessForView(views[0]) ;
    var dividerThickness = this.getThicknessForView(views[1]) ;
    var direction = this.get('layoutDirection') ;

    // top/left view
    var view = views[0];
    var isCollapsed = view.get('isCollapsed') || NO ;
    view.setIfChanged('isVisible', !isCollapsed) ;

    // split divider view
    view = views[1] ;
    view.viewFrameWillChange() ;
    if (direction == SC.HORIZONTAL) {
      view.setIfChanged('styleLeft', topLeftThickness) ;
    } else {
      view.setIfChanged('styleTop', topLeftThickness) ;
    }
    view.viewFrameDidChange() ;

    // bottom/right view
    view = views[2] ;
    var isCollapsed = view.get('isCollapsed') || NO ;
    view.setIfChanged('isVisible', !isCollapsed) ;
    if (!isCollapsed) {
      view.viewFrameWillChange() ;
      if (direction == SC.HORIZONTAL) {
        view.setIfChanged('styleLeft', topLeftThickness + dividerThickness) ;
        view.setIfChanged('styleRight', 0) ;
        view.setIfChanged('styleWidth', null) ;
      } else {
        view.setIfChanged('styleTop', topLeftThickness + dividerThickness) ;
        view.setIfChanged('styleBottom', 0) ;
        view.setIfChanged('styleHeight', null) ;
      }
      view.viewFrameDidChange() ;
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
  },

  /** @private */
  init: function() {
    sc_super() ;
    this.addClassName(this.get('layoutDirection')) ;
  }


}) ;


