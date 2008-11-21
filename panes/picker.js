// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('panes/overlay') ;

SC.PICKER_PANE = 'picker';
SC.PickerPaneView = SC.OverlayPaneView.extend({
  
  emptyElement: '<div class="pane picker-pane"><div class="shadow pane-wrapper picker-pane-wrapper"><div class="pane-root"></div><div class="top-left-edge"></div><div class="top-edge"></div><div class="top-right-edge"></div><div class="right-edge"></div><div class="bottom-right-edge"></div><div class="bottom-edge"></div><div class="bottom-left-edge"></div><div class="left-edge"></div></div></div>',
  
  layer: 300,
  
  isModal: false,

  // The ideal position for a picker pane is just below the anchor that 
  // triggered it.  Find that ideal position, then call adjustPosition.
  positionPane: function() {
    var anchor = this.anchorView ;
    var picker = this.containerView ;
    var origin ;
    
    // usually an anchorView will be passed.  The ideal position to appear is
    // just below the anchorView.  If that is not possible, fitToScreen will
    // take care of that.
    if (anchor) {
      origin = picker.convertFrameFromView(anchor.get('frame'), anchor) ;
      origin.y += origin.height ;
      origin = this.fitPositionToScreen(origin, picker, anchor) ;
      
    // if no anchor view has been set for some reason, just center.
    } else {
      var wsize = SC.window.get('size') ;
      var psize = picker.get('size') ;
      origin = {};
      origin.x = (wsize.width - psize.width) / 2 ;
      origin.y = (wsize.height - psize.height) / 2 ;
    }
    
    picker.set('origin',origin) ;
  }
  
  
}) ;

