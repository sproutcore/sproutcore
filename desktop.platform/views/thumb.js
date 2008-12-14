// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  @class

  A ThumbView works in concert with SC.SplitView to adjust the divider 
  position from an arbitrary subview of the SplitView. Simply make an
  instance of ThumbView a child somewhere it the childViews (or 
  descendants) of the split view and add the path to the ThumbView to the
  SplitView's thumbViews array.
  
  SplitView will automaticall set the splitView property of the views in
  its thumbViews array.

  @extends SC.View

  @author Erich Ocean
*/
SC.ThumbView = SC.View.extend(
/** @scope SC.ThumbView.prototype */ {

  styleClass: ['sc-thumb-view'],
  
  mouseDown: function(evt) {
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : sc_super();
  }
    
});
