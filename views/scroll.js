// ==========================================================================
// Sproutcore.ScrollView
// ==========================================================================

require('views/container') ;

/** @class

  The scroll view is used throughout SproutCore anytime you need to display
  content that can be scrolled.  Although you can make any div scrollable in
  HTML using CSS, SC.ScrollView provides a number of additional advantages
  including support for incremental rendering, auto-scrolling during a
  drag operations and support for custom scroll bars.

  Scroll views are generally included automatically if you use the built-in
  view helpers in SproutCore.  Depending on the views you are writing, you may
  want to use scroll views yourself as well.  The following sections describe
  how you can use the scroll view to support incremental rendering and auto-
  scrolling dragging.
  
  h3. Using Scroll Views for Incremental Rendering
  
  Coming Soon...

  @extends SC.View
  @author  Charles Jolley  
  @version 1.0
*/
SC.ScrollView = SC.View.extend(
/** @scope SC.ScrollView.prototype */ {

  emptyElement: '<div class="sc-scroll-view"></div>'
    
}) ;
