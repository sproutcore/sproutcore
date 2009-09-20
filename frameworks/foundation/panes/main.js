// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('panes/pane');

/** @class

  Most SproutCore applications have a main pane, which dominates the 
  application page.  You can extend from this view to implement your own main 
  pane.  This class will automatically make itself main whenever you append it 
  to a document, removing any other main pane that might be currently in 
  place.  If you do have another already focused as the keyPane, this view 
  will also make itself key automatically.  The default way to use the main 
  pane is to simply add it to your page like this:
  
  {{{
    SC.MainPane.create().append();
  }}}
  
  This will cause your root view to display.  The default layout for a 
  MainPane is to cover the entire document window and to resize with the 
  window.

  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.MainPane = SC.Pane.extend({

  /** @private */
  layout: { left:0, right:0, top:0, bottom:0 },
  
  /** @private - extends SC.Pane's method */
  paneDidAttach: function() {
    var ret = sc_super();
    var responder = this.rootResponder;
    responder.makeMainPane(this);
    if (!responder.get('keyRootView')) responder.makeKeyPane(this);
    return ret ;
  },
  
  /** @private */
  acceptsKeyPane: YES,

  /** @private */
  classNames: ['sc-main']
  
});