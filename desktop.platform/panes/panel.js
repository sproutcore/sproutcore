// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('panes/overlay') ;

// A panel should be used for long-term modal interfaces.  For example, you
// might use a panel for preferences or configuration settings.  These are 
// mini-parts of the application.
SC.PANEL_PANE = 'panel';
SC.PanelPaneView = SC.OverlayPaneView.extend({
  
  emptyElement: '<div class="pane panel-pane"><div class="shadow pane-wrapper"><div class="pane-root"></div><div class="top-left-edge"></div><div class="top-edge"></div><div class="top-right-edge"></div><div class="right-edge"></div><div class="bottom-right-edge"></div><div class="bottom-edge"></div><div class="bottom-left-edge"></div><div class="left-edge"></div></div></div>',
  
  layer: 100
    
}) ;

