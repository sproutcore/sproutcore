// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @namespace
  This protocol defines the allowable transition plugin methods.

  SC.ContainerView uses transition plugins to setup, execute and cleanup the
  swapping between views and expects the given transition plugin object
  to implement the methods in this protocol.
*/
SC.TransitionProtocol = {

  /**
    This optional method is called to set up the entrance transition (i.e.
    transitionIn or transitionShow).

    Use this method to adjust the layout of the view so that it may be properly
    animated.  For example, you may need to adjust the content from a flexible
    layout (i.e. { left: 0, top: 0, right: 0, bottom: 0 }) to a fixed layout
    (i.e. { left: 0, top: 0, width: 100, height: 200 }) so that it can be
    moved.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
  */
  setupIn: function (view, options) {},

  /**
    This optional method is called to set up the exit transition (i.e.
    transitionOut or transitionHide).

    Use this method to adjust the layout of the view so that it may be properly
    animated.  For example, you may need to adjust the content from a flexible
    layout (i.e. { left: 0, top: 0, right: 0, bottom: 0 }) to a fixed layout
    (i.e. { left: 0, top: 0, width: 100, height: 200 }) so that it can be
    moved.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionHideOptions or transitionOutOptions.
  */
  setupOut: function (view, options) {},

  /**
    This method is called to transition the view in or visible (i.e.
    transitionIn or transitionShow).

    When the transition completes, this function *must* call `didTransitionIn()`
    on the view, passing this object and the original options as
    arguments.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
  */
  runIn: function (view, options, context) {},

  /**
    This method is called to transition the view out or hidden (i.e.
    transitionOut or transitionHide).

    When the transition completes, this function *must* call `didTransitionIn()`
    on the view, passing this object and the original options as
    arguments.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionHideOptions or transitionOutOptions.
  */
  runOut: function (view, options, context) {},

  /**
    This optional method is called to cancel an active entrance transition.

    Use this method to stop the animation and immediately clean up the view.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
  */
  cancelIn:  function (view, options) {},

  /**
    This optional method is called to cancel an active exit transition.

    Use this method to stop the animation and immediately clean up the view.

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionHideOptions or transitionOutOptions.
  */
  cancelOut:  function (view, options) {},

  /**
    This optional method is called to clean up the entrance transition after
    completion.

    Use this method to adjust the layout view after the transition completes.
    For example, you may need to adjust the layout from a temporary fixed
    layout (i.e. { left: 0, top: 0, width: 100, height: 200 }) back to its
    original flexible layout (i.e. { left: 0, top: 0, right: 0, bottom: 0 }).

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionShowOptions or transitionInOptions.
  */
  teardownIn: function (view, options) {},

  /**
    This optional method is called to clean up the exit transition after
    completion.

    Use this method to adjust the layout view after the transition completes.
    For example, you may need to adjust the layout from a temporary fixed
    layout (i.e. { left: 0, top: 0, width: 100, height: 200 }) back to its
    original flexible layout (i.e. { left: 0, top: 0, right: 0, bottom: 0 }).

    @param {SC.View} view The view being transitioned.
    @param {Object} options Options to modify the transition.  As set by transitionHideOptions or transitionOutOptions.
  */
  teardownOut: function (view, options) {}

};
