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
  // This property will be set to the element (or view.get('layer')) that triggered your picker to show
  // You can use this to properly position your picker.
  anchorElement: null,

  popup: function(anchorViewOrElement, triggerEvent) {
    this.set('anchorElement',anchorViewOrElement.get('layer') || anchor) ;
    this.positionPane();
    this.append();
  },

  // The ideal position for a picker pane is just below the anchor that 
  // triggered it.  Find that ideal position, then call adjustPosition.
  positionPane: function() {
    var anchor = this.anchorElement ;
    var picker = this.contentView ;
    var origin ;
    
    // usually an anchorElement will be passed.  The ideal position to appear is
    // just below the anchorElement. Current default position is fine tunned visual alignment for popupMenu
    // If that is not possible, fitToScreen will take care of that for other alternative and fallback position.
    if (anchor) {
	    origin = this.computeAnchorRect(anchor);
      origin.x += 1 ;
      origin.y += origin.height + 4;
      origin = this.fitPositionToScreen(origin, picker, anchor) ;
	    picker.set('layout', { width: picker.layout.width, height: picker.layout.height, left: origin.x, top: origin.y });
    } else {
	    // if no anchor view has been set for some reason, just center.
	    picker.set('layout', { width: picker.layout.width, height: picker.layout.height, centerX: 0, centerY: 0 });
    }
  },

	computeAnchorRect: function(anchor) {
		var ret = SC.viewportOffset(anchor); // get x & y
		var cq = SC.$(anchor);
		ret.width = cq.width();
		ret.height = cq.height();
		return ret ;
	},
	
  fitPositionToScreen: function(preferredPosition, paneView, anchor) {
    return preferredPosition;    
  },

  click: function(evt) {
    var f=this.contentView.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return true ; 
  },

  // define the range for clicking inside so the picker won't be clicked away
  // default is the range of contentView frame. Over-write for adjustments. ex: shadow
	clickInside: function(frame, evt) {
		return (evt.pageX >= frame.x && evt.pageX <= (frame.x+frame.width) && evt.pageY >= frame.y && evt.pageY <= (frame.y+frame.height));
	},

  /** 
    re-position picker whenever the window resizes. 
  */
  windowSizeDidChange: function(oldSize, newSize) {
	  sc_super();
    this.positionPane();
  }

});

