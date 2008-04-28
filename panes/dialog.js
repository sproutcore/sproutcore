// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('panes/overlay') ;

SC.DIALOG_PANE = 'dialog';
SC.DialogPaneView = SC.OverlayPaneView.extend({
  
  emptyElement: '<div class="pane dialog-pane"><div class="shadow pane-wrapper"><div class="pane-root"></div><div class="top-left-edge"></div><div class="top-edge"></div><div class="top-right-edge"></div><div class="right-edge"></div><div class="bottom-right-edge"></div><div class="bottom-edge"></div><div class="bottom-left-edge"></div><div class="left-edge"></div></div></div>',
  
  layer: 200

}) ;

