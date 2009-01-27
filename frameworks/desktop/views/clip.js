// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Used as part of a scroll view to display a scrolled content.
  
  Clip views are rarely used on their own.  Instead, you use them as part of
  a scroll view to respond to scrolling actions coming from scrollbars and 
  other controls.

  h1. Clip Views vs. scrollTop/scrollLeft
  
  Although HTML/DOM provides a mechanism to control the scroll location of a  view using the scrollTop/scrollLeft properties, the clip view uses a different mechanism.  It manages a single content view and adjusts the top/left origin accordingly according to the scrollLeft and scrollTop properties.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.ClipView = SC.View.extend({

  /** The content view you want the clip view to manage. */
  contentView: null,
  
  canScrollHorizontal: YES,
  horizontalScrollOffset: 0,

  canScrollVertical: YES,
  verticalScrollOffset: 0,
  
  createChildViews: function() {
    var contentView = this.get('contentView') ;
    
    // if no content view is explicitly defined, get the contentView from the
    // parent view.
    if (!contentView) {
      var pv = this.get('parentView') ;
      if (pv && !SC.none(pv.contentView)) contentView = pv.get('contentView');
    }
    
    if (contentView) {
      contentView = this.createChildView(contentView) ;
      this.set('contentView', contentView).set('childViews', [contentView]);
    }
    return this ;
  },

  horizontalScrollOffsetDidChange: function() {
    var contentView = this.get('contentView');
    var canScroll = this.get('canScrollHorizontal');
    if (!contentView || !canScroll) return ;

    var offset = this.get('horizontalScrollOffset');
    contentView.adjust('left', 0-offset);
  }.observes('canScrollHorizontal', 'horizontalScrollOffset'),

  verticalScrollOffsetDidChange: function() {
    var contentView = this.get('contentView');
    var canScroll = this.get('canScrollVertical');
    if (!contentView || !canScroll) return ;

    var offset = this.get('verticalScrollOffset');
    contentView.adjust('top', 0-offset);
  }.observes('canScrollVertical', 'verticalScrollOffset')

}) ;