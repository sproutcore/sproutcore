// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A ThumbView works in concert with SC.SplitView to adjust the divider 
  position from an arbitrary subview of the SplitView. Simply make an
  instance of ThumbView a child somewhere in the childViews (or 
  descendants) of the split view and add the path to the ThumbView to the
  SplitView's thumbViews array.
  
  SplitView will automatically set the splitView property of the views in
  its thumbViews array.

  @extends SC.View
  @author Erich Ocean
  @test in split
*/
SC.ThumbView = SC.View.extend(
/** @scope SC.ThumbView.prototype */ {

  classNames: ['sc-thumb-view'],
  
  /**
    Enable this thumb view to control its parent split view.
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /** @private */
  prepareContext: function(context, firstTime) {
    var splitView = this.get('splitView') ;
    if (splitView) this.set('cursor', splitView.get('thumbViewCursor')) ;
    return sc_super() ;
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO ;
    
    var splitView = this.get('splitView');
    return (splitView) ? splitView.mouseDownInThumbView(evt, this) : sc_super();
  }
    
});
