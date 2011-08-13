// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('mixins/action_support');
sc_require('views/template');

/**
  @class
  @extends SC.TemplateView
  @extends SC.ActionSupport
*/
SC.Button = SC.TemplateView.extend(SC.ActionSupport,
/** @scope SC.Button.prototype */
{

  classNames: ['sc-button'],
  isEnabled: YES,

  mouseDown: function() {
    if (this.isEnabled) {
      this.set('isActive', true);
      this._isMouseDown = YES;
    }
  },

  mouseExited: function() {
    this.set('isActive', false);
  },

  mouseEntered: function() {
    if (this._isMouseDown && this.isEnabled) {
      this.set('isActive', true);
    }
  },

  rootResponder: function() {
    var pane = this.get('pane');
    return pane.get('rootResponder');
  }.property('pane').cacheable(),

  mouseUp: function(event) {
    if (this.get('isActive') && this.isEnabled) {
      this.fireAction();
      this.set('isActive', false);
    }

    this._isMouseDown = NO;
  },

  touchStart: function(touch) {
		if(this.isEnabled){
    	this.mouseDown(touch);
		}
  },

  touchEnd: function(touch) {
		if(this.isEnabled){
    	this.mouseUp(touch);
		}
  }

});
