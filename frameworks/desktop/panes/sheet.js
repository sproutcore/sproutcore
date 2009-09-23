// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
  Displays a modal sheet pane animated drop down from top.

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
*/
SC.SheetPane = SC.PanelPane.extend({
  
  classNames: 'sc-sheet',
  
  /**
    Speed of transition.  Should be expressed in msec.
  */
  transitionDuration: 200,
  
  _state: 'NO_VIEW', // no view
  
  // Local Layout for the pane...stored for later
  _openLayout: { top: 0, left: 0, bottom: 0, right: 0 },
  _anchoredLayout: { top: 0, left: 0, width: 0, height: 0 },
  
  // states for view animation
  NO_VIEW: 'NO_VIEW',
  ANIMATING: 'ANIMATING',
  READY: 'READY',
  
  SLIDE_DOWN: 'SLIDEDOWN',
  SLIDE_UP: 'SLIDEUP',
  
  BLIND_DOWN: 'BLINDDOWN',
  BLIND_UP: 'BLINDUP',

  /** @private - standard layout assigned to views at rest and empty layout when contentview disappears*/
  STANDARD_LAYOUT: { top: 0, left: 0, bottom: 0, right: 0 },
  OFFSCREEN_LAYOUT: { top: 0, height: 0},
  
  init: function(){
    sc_super();
    
    this._openLayout = this.get('layout');
    var pframe = this.computeParentDimensions();
    this._anchoredLayout = SC.View.convertLayoutToAnchoredLayout(this._openLayout, pframe);
    this.set('layout', SC.merge(this._anchoredLayout, this.OFFSCREEN_LAYOUT));
  },
  
  replaceContent: function(newContent) {
    sc_super();
    this._anchoredLayout = SC.View.convertLayoutToAnchoredLayout(this._openLayout, this.computeParentDimensions());
    this.set('layout', SC.merge(this._anchoredLayout, this.OFFSCREEN_LAYOUT));
    
    this.slideDown();
  },
  
  slideDown: function(){
    this.append();
    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this._direction = this.SLIDE_DOWN;
    this.tick();
  },
  
  slideUp: function(){
    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this._direction = this.SLIDE_UP;
    this.tick();
  },
  
  blindDown: function(){
    this.append();
    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this._direction = this.BLIND_DOWN;
    this.tick();
  },
  
  blindUp: function(){
    // setup other general state
    this._start   = Date.now();
    this._end     = this._start + this.get('transitionDuration');
    this._state   = this.ANIMATING;
    this._direction = this.BLIND_UP;
    this.tick();
  },
  
  // Needed because of the runLoop and that it is animated...must lose focus because will break if selection is change on text fields that don't move.
  blurTo: function(pane) { this.setFirstResponder(''); },
    
  /** @private - called while the animation runs.  Will move the content view down until it is in position and then set the layout to the content layout
   */
  tick: function() {  
    this._timer = null ; // clear out
    
    var now = Date.now();
    var target = this;
    var pct = (now-this._start)/(this._end-this._start);
    var dir = this._direction, layout, newLayout, adjust;
    if (pct<0) pct = 0;
    
    // the view is no longer visible, 
    if (!this.get('isVisibleInWindow')){
      newLayout = SC.View.convertLayoutToAnchoredLayout(this._openLayout, this.computeParentDimensions());
      target.adjust(SC.merge(newLayout, this.OFFSCREEN_LAYOUT));
      this.updateLayout();
    }
    // If we are done...
    if (pct>=1) {
      if (dir === this.SLIDE_DOWN || dir == this.BLIND_DOWN){
        target.adjust(this._openLayout);
        this.awake();
      }
      else {
        newLayout = SC.View.convertLayoutToAnchoredLayout(this._openLayout, this.computeParentDimensions());
        target.adjust(SC.merge(newLayout, this.OFFSCREEN_LAYOUT));
        this.remove();
      }
      this._state   = this.READY;
      this.updateLayout();
      return this;
    }

    // ok, now let's compute the new layouts for the two views and set them
    layout = SC.clone(this.get('layout'));
    adjust = Math.floor(this._anchoredLayout.height * pct);
    var invokeAgain = YES;
    
    // set the layout for the views, depending on the direction
    if (dir == this.SLIDE_DOWN) {
      layout.height = this._anchoredLayout.height;
      layout.top = 0-(layout.height-adjust);
      target.adjust(layout);
    } 
    else if (dir == this.SLIDE_UP) {
      layout.height = this._anchoredLayout.height;
      layout.top = 0-adjust;
      target.adjust(layout);
    }
    else if (dir == this.BLIND_DOWN) {
      layout.top = this._anchoredLayout.top;
      layout.height = adjust;
      target.adjust(layout);
    }
    else if (dir == this.BLIND_UP) {
      layout.top = this._anchoredLayout.top;
      layout.height = this._anchoredLayout.height-adjust;
      target.adjust(layout);
    }
    else {
      target.adjust(this._openlayout);
      invokeAgain = NO;
    }
    this.updateLayout();
    this._timer = invokeAgain ? this.invokeLater(this.tick, 20) : null ;
    
    return this;
  }

});