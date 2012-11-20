// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @static
  This protocol defines the allowable transition plugin methods.

  SC.ContainerView uses transition plugins to setup, execute and cleanup the
  swapping between views and expects the given transition plugin object
  to implement all the methods in this protocol.

  Note: The transition plugin is responsible for appending the new content
  and removing the old content properly.  However, the plugin should NOT destroy
  the old content, which will be handled by whichever object created the old
  content instance.
*/
SC.TransitionProtocol = {

  /**
    This method is called to cancel an active transition and will be called
    before a new transition is set up.

    Use this method to stop the animation and immediately clean up the views.

    @param {SC.ContainerView} container The SC.ContainerView using this plugin.
    @param {SC.View} currentContent The current view in the container.
    @param {SC.View} newContent The new view to add to the container.
    @param {Object} options Options to modify the transition.
  */
  cancel:  function (container, currentContent, newContent, options) {},

  /**
    This method is called to actually run the transition.

    The onComplete method should be called when the transition is done.

    @param {SC.ContainerView} container The SC.ContainerView using this plugin.
    @param {SC.View} currentContent The current view in the container.
    @param {SC.View} newContent The new view to add to the container.
    @param {Object} options Options to modify the transition.
    @param {Function} onComplete A function to call when the transition is complete.
  */
  run: function (container, currentContent, newContent, options, onComplete) {},


  /**
    This method is called to set up the transition.

    Use this method to adjust the layout of the container, currentContent or
    newContent so that it can be properly animated.  For example, you may
    need to adjust the newContent from a { left: 0, top: 0, right: 0, bottom: 0 }
    layout to a { left: 0, top: 0, width: w, height: h } layout so that it can
    be moved.

    You will likely need to append the newContent at this time as well.

    @param {SC.ContainerView} container The SC.ContainerView using this plugin.
    @param {SC.View} currentContent The current view in the container.
    @param {SC.View} newContent The new view to add to the container.
    @param {Object} options Options to modify the transition.
  */
  setup: function (container, currentContent, newContent, options) {},


  /**
    This method is called to tear down the transition.

    Use this method to adjust the layout of the container, currentContent or
    newContent to clean up after the transition.  For example, you may
    need to adjust the newContent from a { left: 0, top: 0, width: w, height: h }
    layout used for the transition back to a { left: 0, top: 0, right: 0, bottom: 0 }
    layout.

    You will likely need to remove the currentContent at this time as well.

    @param {SC.ContainerView} container The SC.ContainerView using this plugin.
    @param {SC.View} currentContent The current view in the container.
    @param {SC.View} newContent The new view to add to the container.
    @param {Object} options Options to modify the transition.
  */
  teardown: function (container, currentContent, newContent, options) {},

  /**
    This method is called to adjust the clippingFrame during the transition.

    Because some childViews are altered by the clippingFrame of their parent
    views (notably collection views), we may need to provide a modified
    clipping frame while the transition is in process.

    @param {SC.ContainerView} container The SC.ContainerView using this plugin.
    @param {SC.View} currentContent The current view in the container.
    @param {SC.View} newContent The new view to add to the container.
    @param {Object} options Options to modify the transition.
    @returns clippingFrame
  */
  transitionClippingFrame: function (container, clippingFrame, options) {}
};
