// ==========================================================================
// Sproutcore.ScrollView
// ==========================================================================

require('mixins/scrollable') ;
require('views/container') ;

/** 
  @class

  Scroll Views are used throughout SproutCore to provide scrollable areas.
  Although you can use overflow: auto to provide scrollbar anywhere, using
  a ScrollView is preferrable because it will also notify child views anytime
  the view is scrolled.
  
  @extends SC.View
  @author  Charles Jolley  
  @version 1.0
*/
SC.ScrollView = SC.ContainerView.extend(SC.Scrollable, {
  
}) ;
