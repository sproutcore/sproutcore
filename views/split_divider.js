// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/split');

/**
  @class

  A SplitDividerView displays a divider between two views within a SplitView.
  Clicking and dragging the divider will change the thickness of each view
  either to the top/left or bottom/right of the divider.

  Double-clicking on the SplitDividerView will try to collapse the first
  view within the SplitView that has property canCollapse set to true,
  so it is not visible, unless you have canCollapse disabled on the SplitView.

  This view must be a direct child of the split view it works with. It must
  be surrounded by two other views.

  @extends SC.View

  @author Charles Jolley
  @author Lawrence Pit
*/
SC.SplitDividerView = SC.View.extend(
/** @scope SC.SplitDividerView.prototype */ {

  emptyElement: '<div class="sc-split-divider-view"></div>',

  mouseDown: function(evt) {
    // cache some info for later use.
    this._mouseDownLocation = Event.pointerLocation(evt) ;
    this._splitView = this.get('parentNode') ;
    this._topLeftView = this.get('previousSibling') ;
    this._originalTopLeftThickness = this._splitView.getThicknessForView(this._topLeftView) ;
    this._direction = this._splitView.get('layoutDirection') ;

    // return true so we can track mouse dragged.
    return true ;
  },

  mouseDragged: function(evt) {
    // calculate new thickness requested by mouse
    var loc = Event.pointerLocation(evt) ;

    if (this._direction == SC.HORIZONTAL) {
      var offset = loc.x - this._mouseDownLocation.x ;
    } else {
      var offset = loc.y - this._mouseDownLocation.y ;
    }

    var proposedThickness = this._originalTopLeftThickness + offset ;
    this._splitView.setThicknessForView(this._topLeftView, proposedThickness) ;
    this._setCursorStyle() ;
    return true ;
  },

  // clear left overs.
  mouseUp: function(evt) {
    this._mouseDownLocation = this._splitView = this._topLeftView =
    this._originalTopLeftThickness = this._direction = null ;
  },

  doubleClick: function(evt) {
    var splitView = this.get('parentNode') ;

    var view = this.get('previousSibling') ;
    var isCollapsed = view.get('isCollapsed') || NO;
    if (!isCollapsed && !splitView.canCollapseView(view)) {
      view = this.get('nextSibling') ;
      isCollapsed = view.get('isCollapsed') || NO;
      if (!isCollapsed && !splitView.canCollapseView(view)) return;
    }

    if (!isCollapsed) {
      // remember thickness in it's uncollapsed state
      view._uncollapsedThickness = splitView.getThicknessForView(view)  ;
      // and collapse
      splitView.setThicknessForView(view, 0) ;
      // if however the splitview decided not to collapse, clear:
      if (!view.get("isCollapsed")) {
        view._uncollapsedThickness = null;
      }
    } else {
      // uncollapse to the last thickness in it's uncollapsed state
      splitView.setThicknessForView(view, view._uncollapsedThickness) ;
      view._uncollapsedThickness = null ;
    }
    this._setCursorStyle() ;
    return true ;
  },

  _setCursorStyle: function() {
    var splitView = this.get('parentNode') ;
    var direction = splitView.get('layoutDirection') ;
    var tlView = this.get('previousSibling') ;
    var brView = this.get('nextSibling') ;
    tlThickness = splitView.getThicknessForView(tlView) ;
    brThickness = splitView.getThicknessForView(brView) ;
    if (tlView.get('isCollapsed') || tlThickness == tlView.get("minThickness") || brThickness == brView.get("maxThickness")) {
      this.setStyle({cursor: direction == SC.HORIZONTAL ? "e-resize" : "s-resize" }) ;
    } else if (brView.get('isCollapsed') || tlThickness == tlView.get("maxThickness") || brThickness == brView.get("minThickness")) {
      this.setStyle({cursor: direction == SC.HORIZONTAL ? "w-resize" : "n-resize" }) ;
    } else {
      this.setStyle({cursor: direction == SC.HORIZONTAL ? "ew-resize" : "ns-resize" }) ;
    }
  }

});
