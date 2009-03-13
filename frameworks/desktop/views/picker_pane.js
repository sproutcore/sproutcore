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

  popup: function(anchorViewOrElement, triggerEvent, preferDefault, preferFallback) {
    this.set('anchorElement',anchorViewOrElement.get('layer') || anchor) ;
    this.positionPane(preferDefault, preferFallback);
    this.append();
  },

  // The ideal position for a picker pane is just below the anchor that 
  // triggered it.  Find that ideal position, then call adjustPosition.
  positionPane: function(preferDefault, preferFallback) {
    var anchor = this.anchorElement ;
    var picker = this.contentView ;
    var origin ;
    
    // usually an anchorElement will be passed.  The ideal position is decided by preferDefault.
    // Current default position is fine tunned visual alignment for popupMenu to appear is just below the anchorElement. 
    // If that is not possible, fitToScreen will take care of that for other alternative and fallback position.
    if (anchor) {
	    anchor = this.computeAnchorRect(anchor);
	    origin = SC.cloneRect(anchor);
	    if(preferDefault) {
		
	    } else {
		    // fine tunned visual alignment. optimized for popupMenu
	      origin.x += 1 ;
	      origin.y += origin.height + 4;		
			}
      origin = this.fitPositionToScreen(origin, picker.get('frame'), anchor, preferFallback) ;
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
	
  fitPositionToScreen: function(preferredPosition, f, a, preferFallback) {
    // get window rect.
    var w = { x: 0, y: 0, width: SC.$().width(), height: SC.$().height() } ;
    f.x = preferredPosition.x ; f.y = preferredPosition.y ;

    if(preferFallback) {
	
    } else {
	    // make sure the right edge fits on the screen.  If not, anchor to 
	    // right edge of anchor or right edge of window, whichever is closer.
	    if (SC.maxX(f) > w.width) {
	      var mx = Math.max(SC.maxX(a), f.width) ;
	      f.x = Math.min(mx, w.width) - f.width ;
	    }

	    // if the left edge is off of the screen, try to position at left edge
	    // of anchor.  If that pushes right edge off screen, shift back until 
	    // right is on screen or left = 0
	    if (SC.minX(f) < 0) {
	      f.x = SC.minX(Math.max(a,0)) ;
	      if (SC.maxX(f) > w.width) {
	        f.x = Math.max(0, w.width - f.width);
	      }
	    }

	    // make sure bottom edge fits on screen.  If not, try to anchor to top
	    // of anchor or bottom edge of screen.
	    if (SC.maxY(f) > w.height) {
	      var mx = Math.max((a.y - f.height), 0) ;
	      if (mx > w.height) {
	        f.y = Math.max(0, w.height - f.height) ;
	      } else f.y = mx ;
	    }

	    // if Top edge is off screen, try to anchor to bottom of anchor. If that
	    // pushes off bottom edge, shift up until it is back on screen or top =0
	    if (SC.minY(f) < 0) {
	      var mx = Math.min(SC.maxY(a), (w.height - a.height)) ;
	      f.y = Math.max(mx, 0) ;
	    }

	    // min left/right padding to the window
	    if( (f.x + f.width) > (w.width-8) ) f.x = w.width - f.width - 8;
	    if( f.x < 7 ) f.x = 7;
		}
    return f ;
  },

  click: function(evt) {
    var f=this.contentView.get("frame");
    if(!this.clickInside(f, evt)) this.remove();
    return true ; 
  },

  // define the range for clicking inside so the picker won't be clicked away
  // default is the range of contentView frame. Over-write for adjustments. ex: shadow
	clickInside: function(frame, evt) {
		return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame);
	},

  /** 
    re-position picker whenever the window resizes. 
  */
  windowSizeDidChange: function(oldSize, newSize) {
	  sc_super();
    this.positionPane();
  }

});

