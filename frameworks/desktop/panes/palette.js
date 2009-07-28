// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
  Displays a non-modal, default positioned, drag&drop-able palette pane.

  The default way to use the palette pane is to simply add it to your page like this:
  
  {{{
    SC.PalettePane.create({
      layout: { width: 400, height: 200, right: 0, top: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}
  
  This will cause your palette pane to display.
  
  Palette pane is a simple way to provide non-modal messaging that won't 
  blocks the user's interaction with your application.  Palette panes are 
  useful for showing important detail informations with flexsible position.
  They provide a better user experience than modal panel.
  
  @extends SC.PanelPane
  @since SproutCore 1.0
*/
SC.PalettePane = SC.PanelPane.extend({
  
  classNames: 'sc-palette',
  
  /** Palettes are not modal by default */
  isModal: NO,
  
  /** Do not show smoke behind palettes */
  modalPane: SC.ModalPane,
  
  isAnchored: NO,
  
  _mouseOffsetX: null,
  _mouseOffsetY: null,

  /** @private - drag&drop palette to new position. */
  mouseDown: function(evt) {
    var f=this.get('frame');
    this._mouseOffsetX = f ? (f.x - evt.pageX) : 0;
    this._mouseOffsetY = f ? (f.y - evt.pageY) : 0;
  },

  mouseDragged: function(evt) {
    if(!this.isAnchored) {
      this.set('layout', { width: this.layout.width, height: this.layout.height, left: this._mouseOffsetX + evt.pageX, top: this._mouseOffsetY + evt.pageY });
      this.updateLayout();
    }
  }
  
 
});