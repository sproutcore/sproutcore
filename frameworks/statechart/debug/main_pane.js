// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('debug/view');

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
        SC.StatechartView.extend({
          layout: { top:0, left:0, right:0, height: 55 }
        }),
        SC.View.extend({
          layout: { top:55, left:0, right:0, bottom: 0 },
          childViews: this.get('childViews'),
          
          /** @private Pretend we're the main pane */
          createChildViews: function() {
            var childViews = this.get('childViews'), 
                len        = childViews.length, 
                idx, key, views, view, parentView = this.get('parentView') ;
                
            this.beginPropertyChanges() ;
            
            // swap the array
            for (idx=0; idx<len; ++idx) {
              if (key = (view = childViews[idx])) {
                
                // is this is a key name, lookup view class
                if (typeof key === SC.T_STRING) {
                  view = parentView[key];
                } else key = null ;
                
                if (view.isClass) {
                  view = this.createChildView(view) ; // instantiate if needed
                  if (key) this[key] = view ; // save on key name if passed
                } 
              }
              childViews[idx] = view;
            }
            
            this.endPropertyChanges() ;
            return this ;
          },
          
        })
      ];
    }
    return sc_super() ;
  }
  
});