// ==========================================================================
// Project:   SproutCore
// Copyright: @2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/container');


SC.mixin(SC.ContainerView,
/** @scope SC.ContainerView */ {
  /** @class
    Provides reveal transitions to SC.ContainerView.  The old content will
    move out revealing the new content underneath.

    To modify the reveal animation, you can set the following transition
    options:

      - direction {String} The direction to move old content off.  Default: 'left'
        ** 'left' - moves old content off to the left
        ** 'right' - moves old content off to the right
        ** 'up' - moves old content off to the top
        ** 'down' - moves old content off to the bottom
      - duration {Number} the number of seconds for the animation.  Default: 0.4
      - timing {String} the animation timing function.  Default: 'ease'

    @extends SC.ViewTransitionProtocol
    @see SC.View#animate for other timing functions.
    @since Version 1.10
  */
  REVEAL: {

    /** @private */
    willBuildOutFromView: function (container, content, options, exitCount) {
      var frame = container.get('frame'),
        height,
        width;

      height = frame.height;
      width = frame.width;

      // Convert to a fixed layout. Put this view on top.
      content.adjust({ bottom: null, right: null, height: height, width: width, zIndex: exitCount });
    },

    /** @private */
    buildOutFromView: function (statechart, container, content, options, exitCount) {
      // We can call this transition repeatedly without effecting the current exit transition.
      if (exitCount === 1) {
        var frame = container.get('frame'),
          key,
          value;

        switch (options.direction) {
        case 'right':
          key = 'left';
          value = -frame.width;
          break;
        case 'up':
          key = 'top';
          value = -frame.height;
          break;
        case 'down':
          key = 'top';
          value = frame.height;
          break;
        default:
          key = 'left';
          value = frame.width;
        }

        content.animate(key, value, {
          duration: options.duration || 0.4,
          timing: options.timing || 'ease'
        }, function (data) {
          if (!data.isCancelled) {
            statechart.exited();
          }
        });
      }
    },

    /** @private */
    didBuildOutFromView: function (container, content, options) {
      // Convert to a flexible layout.
      content.adjust({ bottom: 0, right: 0, height: null, width: null, zIndex: null });
    }

  }

});
