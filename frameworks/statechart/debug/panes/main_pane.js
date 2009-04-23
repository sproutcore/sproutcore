// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('debug/views/debugger');

/** @class
  
  Pose as SC.MainPane with a version that includes the statechart debug bar
  at the top. Only used in debug mode, and if showStatechartDebugger is YES.
  
  @extends SC.MainPane
  @since SproutCore 1.0
*/
SC.MainPane = SC.MainPane.extend(
/** SC.MainPane.prototype */ {
  
  /** @private */
  createChildViews: function() {
    // add statechart debugger view and move original child views below it
    if (this.get('showStatechartDebugger')) {
      this.childViews = [
        SC.StatechartDebuggerView.extend({
          layout: { top:0, left:0, right:0, height: 55 }
        }),
        SC.View.extend({
          layout: { top:55, left:0, right:0, bottom: 0 },
          childViews: this.get('childViews')
        })
      ];
    }
    return sc_super() ;
  }
  
});