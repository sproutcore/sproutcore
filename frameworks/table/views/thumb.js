// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals SC */

/**
  @class

  A ThumbView works in concert with SC.SplitView to adjust the divider 
  position from an arbitrary subview of the SplitView. Simply make an
  instance of ThumbView a child somewhere in the childViews (or 
  descendants) of the split view and add the path to the ThumbView to the
  SplitView's thumbViews array.
  
  SplitView will automatically set the delegate property of the views in
  its thumbViews array.

  @extends SC.View
  @author Christopher Swasey
*/
SC.ThumbView = SC.View.extend(
/** @scope SC.ThumbView.prototype */ {

  classNames: ['sc-thumb-view'],
  
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.bool(),
  
  delegate: null,  
  
  
  render: function(context, firstTime) {
    if(firstTime)
    {
      context.begin('div').classNames(["dragger"]).end();
    }
  },
  
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return NO ;

    var responder = this.getPath('pane.rootResponder') ;
    if (!responder) return NO ;
    
    this._offset = {x: 0, y: 0};
    
    this.invokeDelegateMethod(this.delegate, 'thumbViewDidBeginDrag', this.parentView, evt);
    responder.dragDidStart(this) ;
    
    this._mouseDownX = this._lastX = evt.pageX ;
    this._mouseDownY = this._lastY = evt.pageY ;

    return YES ;
  },

  mouseDragged: function(evt) {
    var offset = this._offset;
    
    offset.x = evt.pageX - this._lastX;
    offset.y = evt.pageY - this._lastY;
    
    this._lastX = evt.pageX;
    this._lastY = evt.pageY;
    
    this.invokeDelegateMethod(this.delegate, 'thumbViewWasDragged', this.parentView, offset, evt);
    return YES;
  },

  mouseUp: function(evt) {
    this._lastX = this._lastY = this._offset = this._mouseDownX = this.mouseDownY = null;
    this.invokeDelegateMethod(this.delegate, 'thumbViewDidEndDrag', this.parentView, evt);
  },
  
  // ..........................................................
  // touch support
  // 
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchesDragged: function(evt, touches) {
     return this.mouseDragged(evt);
  },
   
  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },

  touchExited: function(evt){
    return this.mouseExited(evt);
  }

});