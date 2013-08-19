// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/** @class

  A container view will display its "content" view as its only child.  You can
  use a container view to easily swap out views on your page.  In addition to
  displaying the actual view in the content property, you can also set the
  nowShowing property to the property path of a view in your page and the
  view will be found and swapped in for you.

  # Animated Transitions

  To animate the transition between views, you can provide a transitionSwap
  plugin to SC.ContainerView.  There are several common transitions pre-built
  and if you want to create your own, the SC.ViewTransitionProtocol defines the
  methods to implement.

  The transitions included with SC.ContainerView are:

    - SC.ContainerView.DISSOLVE - fades between the two views
    - SC.ContainerView.FADE_COLOR - fades out to a color and then in to the new view
    - SC.ContainerView.MOVE_IN - moves the new view in over top of the old view
    - SC.ContainerView.PUSH - pushes the old view out with the new view
    - SC.ContainerView.REVEAL - moves the old view out revealing the new view underneath

  To use a transitionSwap plugin, simply set it as the value of the container view's
  `transitionSwap` property.

  For example,

      container = SC.ContainerView.create({
        transitionSwap: SC.ContainerView.PUSH
      });

  Since each transitionSwap plugin predefines a unique animation, SC.ContainerView
  provides the transitionSwapOptions property to allow for modifications to the
  animation.

  For example,

      container = SC.ContainerView.create({
        transitionSwap: SC.ContainerView.PUSH,
        transitionSwapOptions: {
          duration: 1.25,    // Use a longer duration then default
          direction: 'up'    // Push the old content up
        }
      });

  All the predefined transitionSwap plugins take options to modify the default
  duration and timing of the animation and to see what other options are
  available, refer to the documentation of the plugin.

  @extends SC.View
  @since SproutCore 1.0
*/
SC.ContainerView = SC.View.extend(
  /** @scope SC.ContainerView.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    @type Array
    @default ['sc-container-view']
    @see SC.View#classNames
    @see SC.Object#concatenatedProperties
  */
  classNames: ['sc-container-view'],

  /**
    The content view to display.  This will become the only child view of
    the view.  Note that if you set the nowShowing property to any value other
    than 'null', the container view will automatically change the contentView
    to reflect view indicated by the value.

    @type SC.View
    @default null
  */
  contentView: null,

  /** @private */
  contentViewBindingDefault: SC.Binding.single(),

  /**
    Whether the container view is in the process of transitioning or not.

    You should observe this property in order to delay any updates to the new
    content until the transition is complete.

    @type Boolean
    @default false
    @since Version 1.10
  */
  isTransitioning: NO,

  /**
    Optional path name for the content view.  Set this to a property path
    pointing to the view you want to display.  This will automatically change
    the content view for you. If you pass a relative property path or a single
    property name, then the container view will look for it first on its page
    object then relative to itself. If you pass a full property name
    (e.g. "MyApp.anotherPage.anotherView"), then the path will be followed
    from the top-level.

    @type String|SC.View
    @default null
  */
  nowShowing: null,

  /** @private */
  renderDelegateName: 'containerRenderDelegate',

  /**
    The transitionSwap plugin to use when swapping views.

    SC.ContainerView uses a pluggable transition architecture where the
    transition setup, animation and cleanup can be handled by a specified
    transitionSwap plugin.

    There are a number of pre-built plugins available:

      SC.ContainerView.DISSOLVE
      SC.ContainerView.FADE_COLOR
      SC.ContainerView.MOVE_IN
      SC.ContainerView.PUSH
      SC.ContainerView.REVEAL

    You can even provide your own custom transitionSwap plugins.  Just create an
    object that conforms to the SC.SwapTransitionProtocol protocol.

    @type Object (SC.SwapTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionSwap: null,

  /**
    The options for the given transitionSwap plugin.

    These options are specific to the current transitionSwap plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given transition and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.ContainerView.PUSH accepts options
    like:

        transitionSwapOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'linear'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionSwapOptions: null,

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private
    When a container view awakes, it will try to find the nowShowing, if
    there is one, and set it as content if necessary.
  */
  awake: function () {
    sc_super();

    if (this.get('nowShowing')) {
      this.nowShowingDidChange();
    }
  },

  /** @private
    Overridden to prevent clipping of child views while animating.

    In particular, collection views have trouble being animated in a certain
    manner if they think their clipping frame hides themself.  For example,
    the PUSH transition returns a double width/height frame with an adjusted
    left/top while the transition is in process so neither view thinks it
    is clipped.
   */
  clippingFrame: function () {
    var contentStatecharts = this._contentStatecharts,
      frame = this.get('frame'),
      ret = sc_super();

    // Allow for a modified clippingFrame while transitioning.
    if (this.get('isTransitioning')) {
      // Each transition may adjust the clippingFrame to accommodate itself.
      for (var i = contentStatecharts.length - 1; i >= 0; i--) {
        ret = contentStatecharts[i].transitionClippingFrame(ret);
      }
    } else {
      ret.width = frame.width;
    }

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /** @private */
  createChildViews: function () {
    // if contentView is defined, then create the content
    var view = this.get('contentView');

    if (view) {
      view = this.contentView = this.createChildView(view);
      this.childViews = [view];
    }
  },

  /** @private
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function () {
    this.replaceContent(this.get('contentView'));
  }.observes('contentView'),

  /** @private */
  destroy: function () {
    var contentStatecharts = this._contentStatecharts;

    // Exit all the statecharts immediately. This mutates the array!
    if (contentStatecharts) {
      for (var i = contentStatecharts.length - 1; i >= 0; i--) {
        contentStatecharts[i].doExit(true);
      }
    }

    // Remove our internal reference to the statecharts.
    this._contentStatecharts = this._currentStatechart = null;

    return sc_super();
  },

  /** @private
    Invoked whenever the nowShowing property changes.  This will try to find
    the new content if possible and set it.  If you set nowShowing to an
    empty string or null, then the current content will be cleared.
  */
  nowShowingDidChange: function () {
    // This code turns this.nowShowing into a view object by any means necessary.
    var content = this.get('nowShowing');

    // If it's a string, try to turn it into the object it references...
    if (SC.typeOf(content) === SC.T_STRING && content.length > 0) {
      if (content.indexOf('.') > 0) {
        content = SC.objectForPropertyPath(content);
      } else {
        var tempContent = this.getPath(content);
        content = SC.kindOf(tempContent, SC.CoreView) ? tempContent : SC.objectForPropertyPath(content, this.get('page'));
      }
    }

    // If it's an uninstantiated view, then attempt to instantiate it.
    if (content && content.kindOf(SC.CoreView)) {
      content = this.createChildView(content);
    } else {
      content = null;
    }

    // Sets the content.
    this.set('contentView', content);
  }.observes('nowShowing'),

  /** @private Called by new content statechart to indicate that it is ready. */
  statechartReady: function () {
    var contentStatecharts = this._contentStatecharts;

    // Exit all other remaining statecharts immediately.  This mutates the array!
    for (var i = contentStatecharts.length - 2; i >= 0; i--) {
      contentStatecharts[i].doExit(true);
    }

    this.set('isTransitioning', NO);
  },

  /** @private Called by content statecharts to indicate that they have exited. */
  statechartEnded: function (statechart) {
    var contentStatecharts = this._contentStatecharts;

    // Remove the statechart.
    contentStatecharts.removeObject(statechart);
  },

  /** @private
    Replaces any child views with the passed new content.

    This method is automatically called whenever your contentView property
    changes.  You can override it if you want to provide some behavior other
    than the default.

    @param {SC.View} newContent the new content view or null.
  */
  replaceContent: function (newContent) {
    var contentStatecharts,
      currentStatechart = this._currentStatechart,
      newStatechart;

    // Track that we are transitioning.
    this.set('isTransitioning', YES);

    // Create a statechart for the new content.
    contentStatecharts = this._contentStatecharts;
    if (!contentStatecharts) { contentStatecharts = this._contentStatecharts = []; }

    // Call doExit on all current content statecharts.  Any statecharts in the
    // process of exiting may accelerate their exits.
    for (var i = contentStatecharts.length - 1; i >= 0; i--) {
      contentStatecharts[i].doExit();
    }

    // Add the new content statechart, which will enter automatically.
    newStatechart = SC.ContainerContentStatechart.create({
      container: this,
      content: newContent,
      previousStatechart: currentStatechart
    });
    contentStatecharts.pushObject(newStatechart);

    // Track the current statechart.
    this._currentStatechart = newStatechart;
  }

});


/** @private
  In order to support transitioning views in and out of the container view,
  each content view needs its own simple statechart.  This is required, because
  while only one view will ever be transitioning in, several views may be in
  the process of transitioning out.  See the 'SC.ContainerView Statechart.graffle'
  file in the repository.
*/
SC.ContainerContentStatechart = SC.Object.extend({

  // ------------------------------------------------------------------------
  // Properties
  //

  container: null,

  content: null,

  previousStatechart: null,

  state: 'none',

  // ------------------------------------------------------------------------
  // Methods
  //

  init: function () {
    sc_super();

    // Default entry state.
    this.gotoEnteringState();
  },

  transitionClippingFrame: function (clippingFrame) {
    var container = this.get('container'),
      options = container.get('transitionSwapOptions') || {},
      transitionSwap = container.get('transitionSwap');

    if (transitionSwap && transitionSwap.transitionClippingFrame) {
      return transitionSwap.transitionClippingFrame(container, clippingFrame, options);
    } else {
      return clippingFrame;
    }
  },

  // ------------------------------------------------------------------------
  // Actions & Events
  //

  entered: function () {
    if (this.state === 'entering') {
      this.gotoReadyState();
    //@if(debug)
    } else {
      SC.error('Developer Error: SC.ContainerView should not receive an internal entered event while not in entering state.');
    //@endif
    }
  },

  doExit: function (immediately) {
    if (this.state !== 'exited') {
      this.gotoExitingState(immediately);
    //@if(debug)
    } else {
      SC.error('Developer Error: SC.ContainerView should not receive an internal doExit event while in exited state.');
    //@endif
    }
  },

  exited: function () {
    if (this.state === 'exiting') {
      this.gotoExitedState();
    //@if(debug)
    } else {
      SC.error('Developer Error: SC.ContainerView should not receive an internal exited event while not in exiting state.');
    //@endif
    }
  },

  // ------------------------------------------------------------------------
  // States
  //

  // Entering
  gotoEnteringState: function () {
    var container = this.get('container'),
      content = this.get('content'),
      previousStatechart = this.get('previousStatechart'),
      options = container.get('transitionSwapOptions') || {},
      transitionSwap = container.get('transitionSwap');

    // Assign the state.
    this.state = 'entering';

    if (!!content) {
      container.appendChild(content);
    }

    // Don't transition unless there is a previous statechart.
    if (!!previousStatechart && !!content && !!transitionSwap) {
      if (!!transitionSwap.willBuildInToView) {
        transitionSwap.willBuildInToView(container, content, previousStatechart, options);
      }
      if (!!transitionSwap.buildInToView) {
        transitionSwap.buildInToView(this, container, content, previousStatechart, options);
      }
    } else {
      this.entered();
    }
  },

  // Exiting
  gotoExitingState: function (immediately) {
    var container = this.get('container'),
      content = this.get('content'),
      exitCount = this._exitCount,
      options = container.get('transitionSwapOptions') || {},
      transitionSwap = container.get('transitionSwap');

    if (!immediately && !!content && !!transitionSwap) {
      if (this.state === 'entering') {
        if (!!transitionSwap.buildInDidCancel) {
          transitionSwap.buildInDidCancel(container, content, options);
        }
      } else if (this.state === 'exiting') {
        if (!!transitionSwap.buildOutDidCancel) {
          transitionSwap.buildOutDidCancel(container, content, options);
        }
      }
    }

    // Assign the state.
    this.state = 'exiting';

    if (!immediately && !!content && !!transitionSwap) {
      // Re-entering the exiting state may need to accelerate the transition, pass the count to the plugin.
      if (!exitCount) { exitCount = this._exitCount = 1; }

      if (!!transitionSwap.willBuildOutFromView) {
        transitionSwap.willBuildOutFromView(container, content, options, exitCount);
      }

      if (!!transitionSwap.buildOutFromView) {
        transitionSwap.buildOutFromView(this, container, content, options, exitCount);
      }

      // Increment the exit count each time doExit is called.
      this._exitCount += 1;
    } else {
      this.exited();
    }
  },

  // Exited
  gotoExitedState: function () {
    var container = this.get('container'),
      content = this.get('content'),
      options = container.get('transitionSwapOptions') || {},
      transitionSwap = container.get('transitionSwap');

    if (!!content) {
      if (transitionSwap) {
        if (!!transitionSwap.didBuildOutFromView) {
          transitionSwap.didBuildOutFromView(container, content, options);
        }
      }

      if (content.createdByParent) {
        container.removeChildAndDestroy(content);
      } else {
        container.removeChild(content);
      }
    }

    // Send ended event to container view statechart.
    container.statechartEnded(this);

    // Assign the state.
    this.state = 'exited';
  },

  // Ready
  gotoReadyState: function () {
    var container = this.get('container'),
      content = this.get('content'),
      options = container.get('transitionSwapOptions') || {},
      transitionSwap = container.get('transitionSwap');

    if (content && transitionSwap) {
      if (!!transitionSwap.didBuildInToView) {
        transitionSwap.didBuildInToView(container, content, options);
      }
    }

    // Send ready event to container view statechart.
    container.statechartReady();

    // Assign the state.
    this.state = 'ready';
  }

});
