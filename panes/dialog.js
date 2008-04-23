// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('panes/overlay') ;

SC.DIALOG_PANE = 'dialog';
SC.DialogPaneView = SC.OverlayPaneView.extend({
  
  emptyElement: '<div class="pane dialog-pane"><div class="pane-wrapper"><div class="pane-root"></div></div>',
  
  layer: 200

}) ;

