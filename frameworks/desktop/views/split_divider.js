// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
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
  
  /** @private */
  prepareContext: function(context, firstTime) {
    var splitView = this.get('splitView') ;
    if (splitView) this.set('cursor', splitView.get('thumbViewCursor')) ;
    return sc_super() ;
  },
  
  mouseDown: function(evt) {
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : sc_super();
  },
  
  // FIXME: how does this work with event capture?
  doubleClick: function(evt) {
    console.log('doubleClick in split divider');
    var splitView = this.get('splitView');
    return (splitView) ? splitView.doubleClickInThumbView(evt, this) : sc_super();
  }
  
});
