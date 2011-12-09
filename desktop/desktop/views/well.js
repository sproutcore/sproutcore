// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// Constants
SC.WELL_CONTAINER_PADDING=15;

/** @class

  A WellView is a ContainerView with a border. It's useful when you want to
  group a set of views. It allows you to easily switch its contents too.
  
  It has a default contentLayout that will replace the layout of the contentView.
  
  @extends SC.ContainerView
  @since SproutCore 1.0
  @test in progress
*/
SC.WellView = SC.ContainerView.extend(
/** @scope SC.WellView.prototype */ {
  
  classNames: 'sc-well-view',
  
  /**
    Layout for the content of the container view.
    @property {Object}
  */
  contentLayout: {
    top:SC.WELL_CONTAINER_PADDING, bottom:SC.WELL_CONTAINER_PADDING,
    left:SC.WELL_CONTAINER_PADDING, right:SC.WELL_CONTAINER_PADDING},
  
  
  /**
     Overrides createChildViews and replaces the layout of the contentView
     with the one in contentLayout.
   */
  
  createChildViews: function() {
    // if contentView is defined, then create the content
    var view = this.get('contentView') ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      view.set('layout', this.contentLayout);
      this.childViews = [view] ;
    } 
  },
  
  /**
     The render method for the WellView simply add the html necessary for
     the border.
     
   */
  
  render: function(context, firstTime) {
    if(firstTime){
     context.push("<div class='top-left-edge'></div>",
       "<div class='top-edge'></div>",
       "<div class='top-right-edge'></div>",
       "<div class='right-edge'></div>",
       "<div class='bottom-right-edge'></div>",
       "<div class='bottom-edge'></div>",
       "<div class='bottom-left-edge'></div>",
       "<div class='left-edge'></div>",
       "<div class='content-background'></div>");
     }    
     sc_super();
  },
  
  /**
     Invoked whenever the content property changes.  This method will simply
     call replaceContent and set the contentLayout in the new contentView.
     
     Override replaceContent to change how the view is
     swapped out.
   */
  contentViewDidChange: function() {
    var view = this.get('contentView');
    view.set('layout', this.contentLayout);
    this.replaceContent(view);
  }.observes('contentView')
  
}) ;
