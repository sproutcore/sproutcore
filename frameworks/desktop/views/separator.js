// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/**
  @class

  Displays a horizontal or vertical separator line.  Simply create one of 
  these views and configure the layout direction and layout frame.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.SeparatorView = SC.View.extend(
/** @scope SC.SeparatorView.prototype */ {

  classNames: ['sc-separator-view'],
  tagName: 'span',

  /** 
    Select the direction of the separator line.  Must be one of SC.LAYOUT_VERTICAL or SC.LAYOUT_HORIZONTAL.
    
    @property {String}
  */
  layoutDirection: SC.LAYOUT_HORIZONTAL,

  render: function(context, firstTime) {
    if(firstTime) context.push('<span></span>');
	  context.addClass(this.get('layoutDirection'));
  }



});
