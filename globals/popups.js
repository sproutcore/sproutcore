// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/container') ;
require('globals/panels') ;

// This singleton manages the popups on the page.  It will show an element
// called 'popups', which is appended to the end of the body node.  To show
// a view as a popup, just call the popup() method on it along with an event.
// The view will be shown at the location more appropriate for the event.
// You can choose whether the popup is modal by setting the isModal property
// on the view.
SC.PopupView = SC.PanelView.extend({
  
  emptyElement: '<div id="popups" class="popups"></div>',
    
  wrapperView: SC.ContainerView.extend({
    emptyElement: '<div class="popup"></div>',
    visibleAnimation: {
      visible: 'opacity: 1.0',
      hidden: 'opacity: 0.0',
      duration: 200,
      onComplete: function(wrapperView) {
        if (!wrapperView.get('isVisible')) {
          SC.popups.hidePanelDidComplete(wrapperView) ;
        }
      }
    }
  }),
  
  locationFor: function(view,ev) {
    var loc = Event.pointerLocation(ev) ;
    var x = (ev) ? (loc.x - 20) : 100 ;
    var y = (ev) ? lox.y : 100 ;
    var dim = view.get('size') ;
    var screenSize = Element.getDimensions(this) ;
    
    // fit on screen
    var shift = (x+dim.width+50) - screenSize.width ;
    if (shift>0) x -= shift ;
    var shift = (y+dim.height+20) - screenSize.height ;
    if (shift>0) y -= shift ;
    
    return { left: x+'px', top: y+'px' };
  },
  
  // ...................................
  // VIEW SUPPORT FUNCTION
  //  
  // called in the context of the view.
  viewHide: function() { SC.page.get('popups').hidePanel(this); }
    
}) ;

SC.callOnLoad(function() { 
  if (!SC.page) SC.page = SC.Page.create() ;
  SC.page.popups = SC.PopupView.outletFor(null); 
}) ;
