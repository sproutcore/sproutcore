// ==========================================================================
// SC.ScrollView
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
  
  emptyElement: '<div class="sc-scroll-view"></div>',
  
  /** 
    Determines if the view should be scrollable vertically.  
    
    If this property is set to NO then the vertical scrollbar will always
    be hidden.
    
    @field
  */
  canScrollVertical: YES,

  /**
    Determines if the view should be scrollable horizontally.
    
    If this property is set to NO then the horizontal scrollbale will always
    be hidden.
    
    @field
  */
  canScrollHorizontal: NO,
  
  _canScrollVerticalObserver: function() {
    this.setClassName('sc-scroll-vertical', this.get('canScrollVertical'));
  }.observes('canScrollVertical'),

  _canScrollHorizontalObserver: function() {
    this.setClassName('sc-scroll-horizontal', this.get('canScrollHorizontal'));
  }.observes('canScrollHorizontal'),

  init: function() {
    sc_super() ;
    this._canScrollVerticalObserver() ;
    this._canScrollHorizontalObserver() ;
  },

  // auto fit child view based on which scrollviews are visible
  resizeChildrenWithOldSize: function(oldSize) {
    var v = this.get('firstChild') ;
    if (v) {
      var f = v.get('frame');
      var orig = Object.clone(f) ;
      var innerFrame = this.get('innerFrame') ;
      f.x = f.y = 0 ;
      if (!this.get('canScrollHorizontal')) f.width = innerFrame.width ;
      if (!this.get('canScrollVertical')) f.height = innerFrame.height ;
      if (!SC.rectsEqual(f, orig)) v.set('frame', f) ;
    }
  }
  
}) ;


