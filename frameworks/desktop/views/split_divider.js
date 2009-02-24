// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/split');

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
  @author Erich Ocean
  @test in split
*/
SC.SplitDividerView = SC.View.extend(
/** @scope SC.SplitDividerView.prototype */ {

  classNames: ['sc-split-divider-view'],
  
  mouseDown: function(evt) {
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : sc_super();
  },
  
  // FIXME: how does this work with event capture?
  doubleClick: function(evt) {
    console.log('doubleClick in split divider');
    var splitView = this.get('splitView');
    return (splitView) ? splitView.doubleClickInThumbView(evt, this) : sc_super();
    // var view = this._tlView ;
    // var isCollapsed = view.get('isCollapsed') || NO ;
    // if (!isCollapsed && !this._splitView.canCollapseView(view)) {
    //   view = this._brView ;
    //   isCollapsed = view.get('isCollapsed') || NO ;
    //   if (!isCollapsed && !this._splitView.canCollapseView(view)) return;
    // }
    // 
    // if (!isCollapsed) {
    //   // remember thickness in it's uncollapsed state
    //   view._uncollapsedThickness = this._splitView.getThicknessForView(view)  ;
    //   // and collapse
    //   this._splitView.setThicknessForView(view, 0) ;
    //   // if however the splitview decided not to collapse, clear:
    //   if (!view.get("isCollapsed")) {
    //     view._uncollapsedThickness = null;
    //   }
    // } else {
    //   // uncollapse to the last thickness in it's uncollapsed state
    //   this._splitView.setThicknessForView(view, view._uncollapsedThickness) ;
    //   view._uncollapsedThickness = null ;
    // }
    // this._setCursorStyle() ;
    return true ;
  }
  
});
