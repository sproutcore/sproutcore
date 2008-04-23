// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/split');

/** 
  @class

  A SplitDividerView displays a divider between two split views.  Clicking
  and dragging the divider will change the thickness of the view either to 
  the left or right of the divider, depending on which side of the flexible
  view the divider is on.
  
  Double-clicking will try to collapse the same view so it is not visible
  unless you have canCollapse disabled on the SplitView.
  
  This view must be a direct child of the split view it works with.
  
  @extends SC.View
  
  @author Charles Jolley
*/
SC.SplitDividerView = SC.View.extend(
/** @scope SC.SplitDividerView.prototype */ {
  
  emptyElement: '<div class="sc-split-divider-view"></div>',

  /**
    Returns the view to be managed by the divider view.
  */
  targetView: function() {  
    var splitView = this.get('parentNode') ;
    if (!splitView) return null ;

    var flexibleView = splitView.computeFlexibleView() ;
    var views = splitView.get('childNodes') ;
    var myIndex = views.indexOf(this) ;
    var flexibleIndex = views.indexOf(flexibleView) ;
    
    if (myIndex < 0) throw "SplitDividerView must belong to the SplitView";
    
    return (myIndex <= flexibleIndex) ? this.get('previousSibling') : this.get('nextSibling') ;

  }.property(),
  
  mouseDown: function(evt) {

    var splitView = this.get('parentNode') ;
    if (!splitView) return ;
    
    // cache some info for later use.
    this._mouseDownLocation = Event.pointerLocation(evt) ;

    this._targetView = this.get('targetView') ;
    
    // determine the view to change.
    this._originalThickness = splitView.thicknessForView(this._targetView);
    
    this._direction = splitView.get('layoutDirection') ;
    
    // return true so we can track mouse dragged.
    return true ;
  },
  
  mouseDragged: function(evt) {
    
    // calculate new thickness
    var loc = Event.pointerLocation(evt) ;
    
    if (this._direction == SC.HORIZONTAL) {
      var offset = loc.x - this._mouseDownLocation.x ;
    } else {
      var offset = loc.y - this._mouseDownLocation.y ;
    }

    var thickness = this._originalThickness + offset ;
    var splitView = this.get('parentNode') ;
    splitView.setThicknessForView(this._targetView, thickness) ;
    
    return true ;
  },
  
  // clear left overs.
  mouseUp: function(evt) {
    this._targetView = this._originalThickness = this._direction = this._mouseDownLocation = null ;
  },
  
  doubleClick: function(evt) {
    var splitView = this.get('parentNode') ;
    if (!splitView) return; // nothing to do.
    
    // try to collapse or un-collapse.
    var targetView = this.get('targetView');
    var isCollapsed = targetView.get('isCollapsed') || NO;
    
    // do not collapse if not allowed.
    if (!isCollapsed && !splitView.canCollapseView(targetView)) return; 
    
    // now set the collapsed state and layout.
    targetView.set('isCollapsed', !isCollapsed) ;
    splitView.layout() ;
    
    return true ;
  }
  
});
