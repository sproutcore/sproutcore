// ==========================================================================
// Project:   Greenhouse.EventBlocker
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */
/** @class
  prevents drag events from hitting iframe 
  
  thanks to Jonathan Lewis
  @extends SC.View
*/
Greenhouse.EventBlocker = SC.View.extend(
/** @scope Greenhouse.EventBlocker.prototype */ {
  
  isVisible: NO,
    
  dragStarted: function(drag, evt) {
    this.set('isVisible', YES);
  },
  dragEnded: function(drag, evt) {
    this.set('isVisible', NO);
  },
  
  isDropTarget: YES,
  
  mouseMoved: function(evt){
    return this.get('isVisible');
  },
  mouseDragged: function(evt){
    return this.get('isVisible');
  }
});
