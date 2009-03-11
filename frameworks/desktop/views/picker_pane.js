// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================


require('views/palette_pane');

/**
  Displays a non-modal, self anchor positioned picker pane.

  The default way to use the picker pane is to simply add it to your page like this:
  
  {{{
    PickerPane.create({
      contentView: SC.View.extend({
        layout: { width: 400, height: 200 }
      })
    }).append();
  }}}
  
  This will cause your picker pane to display.
  
  Picker pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Picker panes are 
  useful for showing important detail informations with optimized position around anchor.
  They provide a better user experience than modal panel.
  
  @extends SC.PalettePane
  @since SproutCore 1.0
*/
SC.PickerPane = SC.PalettePane.extend({
  
  classNames: 'sc-picker-pane',
  isAnchored: true,
  // This property will be set to the view that triggered your picker to show
  // You can use this to properly position your picker.
  anchorView: null,

  popup: function(anchorView, triggerEvent) {
    this.set('anchorView',anchorView) ;
    this.positionPane();
    this.append();
  },

  // The ideal position for a picker pane is just below the anchor that 
  // triggered it.  Find that ideal position, then call adjustPosition.
  positionPane: function() {
    var anchor = this.anchorView ;
    var picker = this.contentView ;
    var origin ;
    
    // usually an anchorView will be passed.  The ideal position to appear is
    // just below the anchorView.  If that is not possible, fitToScreen will
    // take care of that.
    if (anchor) {
	    origin = this.get("frame");
      origin.x = 250;
      origin.y = 250 ;
      origin = this.fitPositionToScreen(origin, picker, anchor) ;
    }
    picker.set('layout', { width: picker.layout.width, height: picker.layout.height, left: origin.x, top: origin.y });
  },

  fitPositionToScreen: function(preferredPosition, paneView, anchor) {
    return preferredPosition;    
  }
});