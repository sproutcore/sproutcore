// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/pane');
sc_require('panes/keyboard');
sc_require('panes/layout');
sc_require('panes/manipulation');
sc_require('panes/visibility');

/** @class

  Most SproutCore applications have a main pane, which dominates the 
  application page.  You can extend from this view to implement your own main 
  pane.  This class will automatically make itself main whenever you append it 
  to a document, removing any other main pane that might be currently in 
  place.  If you do have another already focused as the keyPane, this view 
  will also make itself key automatically.  The default way to use the main 
  pane is to simply add it to your page like this:
  
      SC.MainPane.create().append();
  
  This will cause your root view to display.  The default layout for a 
  MainPane is to cover the entire document window and to resize with the 
  window.

  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.MainPane = SC.Pane.extend({
  /** @private */
  layout: { top: 0, left: 0, bottom: 0, right: 0, minHeight:200, minWidth:200 },
  
  init:function(){
    var wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout'), isOverflowing = false;
    
    //Initial computation to get ride of Lion rubberbanding.
    if (document && document.body) {
      wDim.width = document.body.clientWidth;
      wDim.height = document.body.clientHeight;
      
      if( layout.minHeight || layout.minWidth ) {
        if( (layout.minHeight && wDim.height<=layout.minHeight) || (layout.minWidth && wDim.width<=layout.minWidth) ) {
          SC.bodyOverflowArbitrator.requestVisible(this);
        } else {
          // to avoid Lion rubberbanding
          SC.bodyOverflowArbitrator.requestHidden(this);
        }
      }
    }
    sc_super();
  },
  
  /** @private - extends SC.Pane's method */
  paneDidAttach: function() {
    var ret = sc_super(),
        responder = this.rootResponder;
    responder.makeMainPane(this);
    if (!responder.get('keyRootView')) responder.makeKeyPane(this);
    return ret ;
  },
  
  /** @private */
  acceptsKeyPane: YES,

  /** @private */
  classNames: ['sc-main']
});
