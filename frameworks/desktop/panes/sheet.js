// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


sc_require('panes/panel');

/**
  Displays a modal sheet pane that animates from the top of the viewport.

  The default way to use the sheet pane is to simply add it to your page like this:

  {{{
    SC.SheetPane.create({
      layout: { width: 400, height: 200, centerX: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}

  This will cause your sheet panel to display.  The default layout for a Sheet
  is to cover the entire document window with a semi-opaque background, and to
  resize with the window.

  @extends SC.PanelPane
  @since SproutCore 1.0
  @author Evin Grano
  @author Tom Dale
*/
SC.SheetPane = SC.PanelPane.extend({
  classNames: 'sc-sheet',

  /** Do not show smoke behind palettes */
  modalPane: SC.ModalPane,

  /**
    Speed of transition.  Should be expressed in msec.

    @property {Number}
  */
  transitionDuration: 200,
  
  _state: 'NO_VIEW', // no view
  
  init: function() {
    sc_super();
    
    if (SC.Animatable) {
      SC.SheetPane.ANIMATABLE_AVAILABLE = YES;
      this.mixin(SC.Animatable);
      
      if (!this.transitions) this.transitions = {};
      if (!this.transitions.top) {
        // transitionDuration = 200 seems to be too fast when using Animatable
        this.transitions.top = {
          duration: this.transitionDuration === 200 ? 0.3 : this.transitionDuration/1000,
          action: "_complete",
          target: this
        };
      }
    }
  },

  /**
    Displays the pane.  SheetPane will calculate the height of your pane, draw it offscreen, then
    animate it down so that it is attached to the top of the viewport.

    @returns {SC.SheetPane} receiver
  */
  append: function() {
    var layout = this.get('layout');
    if (!layout.height || !layout.top) {
      layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
    }

    // Gently rest the pane atop the viewport
    layout.top = -1*layout.height;

    if (this.disableAnimation) this.disableAnimation();
    this.adjust(layout);
    this.updateLayout();
    if (this.enableAnimation) this.enableAnimation();
    
    return sc_super();
  },

  /**
    Animates the sheet up, then removes it from the DOM once it is hidden from view.

    @returns {SC.SheetPane} receiver
  */
  remove: function() {
    // We want the functionality of SC.PanelPane.remove(), but we only want it once the animation is complete.
    // Store the reference to the superclass function, and it call it after the transition is complete.
    var that = this, args = arguments;
    this.invokeLater(function() { args.callee.base.apply(that, args) ;}, this.transitionDuration);
    this.slideUp();

    return this;
  },

  /**
    Once the pane has been rendered out to the DOM, begin the animation.
  */
  paneDidAttach: function() {
    var ret = sc_super();
    // this.invokeLast(this.slideDown, this);
    this.slideDown();

    return ret;
  },

  slideDown: function(){
    // setup other general state
    this._state   = SC.SheetPane.ANIMATING;
    this._direction = SC.SheetPane.SLIDE_DOWN;
    if (SC.SheetPane.ANIMATABLE_AVAILABLE) {
      this.transitions.top.timing = SC.Animatable.TRANSITION_EASE_OUT;
      this.adjust('top', 0);
    } else {
      this._start   = Date.now();
      this._end     = this._start + this.get('transitionDuration');
      this.tick();
    }
  },

  slideUp: function(){
    // setup other general state
    this._state   = SC.SheetPane.ANIMATING;
    this._direction = SC.SheetPane.SLIDE_UP;
    if (SC.SheetPane.ANIMATABLE_AVAILABLE) {
      var layout = this.get('layout');
      this.transitions.top.timing = SC.Animatable.TRANSITION_EASE_IN;
      this.adjust('top', -1 * layout.height);
    } else {
      this._start   = Date.now();
      this._end     = this._start + this.get('transitionDuration');
      this.tick();
    }
  },

  _complete: function() {
    var dir = this._direction;

    if (dir === SC.SheetPane.SLIDE_DOWN) {
      if (!SC.SheetPane.ANIMATABLE_AVAILABLE) this.adjust('top', 0);

      // Make sure we recenter the panel after the animation
      // is complete.
      this.adjust({
        centerX: 0,
        left: null
      });
      if(SC.browser.mozilla) this.parentViewDidChange();
    } else {
      var layout = this.get('layout');
      if (!SC.SheetPane.ANIMATABLE_AVAILABLE) this.adjust('top', -1*layout.height);
    }
    
    this._state = SC.SheetPane.READY;
    this.updateLayout();
  },
  
  // Needed because of the runLoop and that it is animated...must lose focus because will break if selection is change on text fields that don't move.
  blurTo: function(pane) { this.setFirstResponder(''); },

  /** @private - called while the animation runs.  Will move the content view down until it is in position and then set the layout to the content layout
   */
  tick: function() {
    this._timer = null ; // clear out

    var now = Date.now();
    var pct = (now-this._start)/(this._end-this._start),
        target = this, dir = this._direction, layout = this.get('layout'), 
        newLayout, adjust;
    if (pct<0) pct = 0;
    
    // If we are done...
    if (pct>=1) {
      this._complete();
      return this;
    }

    // ok, now let's compute the new layouts for the two views and set them
    adjust = Math.floor(layout.height * pct);

    // set the layout for the views, depending on the direction
    if (dir == SC.SheetPane.SLIDE_DOWN) {
      target.adjust('top', 0-(layout.height-adjust));
    } else if (dir == SC.SheetPane.SLIDE_UP) {
      target.adjust('top', 0-adjust);
    }

    this._timer = this.invokeLater(this.tick, 20);
    target.updateLayout();
    return this;
  }
});

SC.SheetPane.mixin( /** @scope SC.SheetPane */ {
  
  ANIMATABLE_AVAILABLE: NO,
  
  // states for view animation
  NO_VIEW: 'NO_VIEW',
  ANIMATING: 'ANIMATING',
  READY: 'READY',

  SLIDE_DOWN: 'SLIDEDOWN',
  SLIDE_UP: 'SLIDEUP'
  
});
