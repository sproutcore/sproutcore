// ==========================================================================
// Sproutcore.ScrollView
// ==========================================================================

require('views/container') ;

/** @class

  Scroll Views are used throughout SproutCore to provide scrollable areas.
  Although you can use overflow: auto to provide scrollbar anywhere, using
  a ScrollView is preferrable because it will also notify child views anytime
  the view is scrolled.
  
  @extends SC.View
  @author  Charles Jolley  
  @version 1.0
*/
SC.ScrollView = SC.View.extend(
/** @scope SC.ScrollView.prototype */ {

  emptyElement: '<div class="sc-scroll-view"></div>',
  
  // add observer to onscroll event.
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    this.rootElement.onscroll = this._onscroll.bind(this) ;
  },
  
  _onscroll: function() {
    console.log('onscroll') ;
  }
    
}) ;
