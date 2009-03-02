// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @namespace 

  Normally, SproutCore views use absolute positioning to display themselves
  on the screen.  While this is both the fastest and most efficient way to 
  display content in the web browser, sometimes your user interface might need
  to take advantage of the more advanced "flow" layout offered by the browser
  when you use static and relative positioning.
  
  This mixin can be added to a view class to enable the use of any kind of 
  static and relative browser positionining.  In exchange for using static
  layout, you will lose a few features that are normally available on a view
  class such as the 'frame' and 'clippingFrame' properties as well as 
  notifications when your view or parentView are resized.
  
  Normally, if you are allowing the browser to manage the size and positioning
  of your view, these feature will not be useful to your code anyway.
  
  h2. Using StaticLayout
  
  To enable static layout on your view, just include this mixin on the view.
  SproutCore's builtin views that are capable of being used in static 
  layouts already incorporate this mixin.  
  
  You can then use CSS or the render() method on your view to setup the 
  positioning on your view using any browser layout mechanism you want.
  
  @since SproutCore 1.0
*/
SC.StaticLayout = {

  /**
    Walk like a duck
  */
  hasStaticLayout: YES,
  
  /**
    Activates use of brower's static layout.  You can apply this mixin and
    still use absolute positioning.  To activate static positioning, set this
    property to YES.
  */
  useStaticLayout: NO,
  
  /** @private - add sc-static-layout class if needed. */
  renderMixin: function(context, firstTime) {
    context.setClass('sc-static-layout', this.get('useStaticLayout'));
  },
  
  /**
    Not available on views with static layout.  Calling this method will raise 
    an exception.
  */
  convertFrameToView: null,

  /**
    Not available on views with static layout.  Calling this method will raise 
    an exception.
  */
  convertFrameFromView: null,
  
  /**
    Frame is not available on views with static layout.  This property will
    always return null.
  */
  frame: null,
  

  /**
    clippingFrame is not available on views with static layout.  This 
    property will always return null.
  */
  clippingFrame: null,
  
  /**
    This method is not supported on static layout views.
  */
  parentViewDidResize: null,
  
  /**
    This method is not supported on static layout views.
  */
  beginLiveResize: null,

  /**
    This method is not supported on static layout views.
  */
  endLiveResize: null,

  /**
    This method is not supported on static layout views.
  */
  viewDidResize: null
  
};