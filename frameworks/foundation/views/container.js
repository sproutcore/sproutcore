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

  To animate the transition between views, you can provide a transition
  plugin to SC.ContainerView.  There are several common transitions pre-built
  and if you want to create your own, the SC.TransitionProtocol defines the
  methods to implement.

  The transitions included with SC.ContainerView are:

    SC.ContainerView.DISSOLVE - fades between the two views
    SC.ContainerView.FADE_COLOR - fades out to a color and then in to the new view
    SC.ContainerView.MOVE_IN - moves the new view in over top of the old view
    SC.ContainerView.PUSH - pushes the old view out with the new view
    SC.ContainerView.REVEAL - moves the old view out revealing the new view underneath

  To use a transition plugin, simply set it as the value of the container view's
  transition property.

  For example,

      container = SC.ContainerView.create({
        transition: SC.ContainerView.PUSH
      });

  Since each transition plugin predefines a unique animation, SC.ContainerView
  provides the transitionOptions property to allow for modifications to the
  transition animation.

  For example,

      container = SC.ContainerView.create({
        transition: SC.ContainerView.PUSH,
        transitionOptions: {
          duration: 1.25,    // Use a longer duration then default
          direction: 'up'    // Push the old content up
        }
      });

  All the predefined transition plugins take options to modify the default
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

  /** @private */
  classNames: ['sc-container-view'],

  /**
    The content view to display.  This will become the only child view of
    the view.  Note that if you set the nowShowing property to any value other
    than 'null', the container view will automatically change the contentView
    to reflect view indicated by the value.

    @property {SC.View}
  */
  contentView: null,

  /** @private */
  contentViewBindingDefault: SC.Binding.single(),

  /**
    Whether the container view is in the process of transitioning or not.

    You should observe this property in order to delay any updates to the new
    content until the transition is complete.

    @property {Boolean}
    @default NO
    @readonly
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

    @property {String, SC.View}
  */
  nowShowing: null,

  /** @private */
  renderDelegateName: 'containerRenderDelegate',

  /**
    The transition to use when swapping views.

    SC.ContainerView uses a pluggable transition architecture where the
    transition setup, animation and cleanup can be handled by a specified
    transition plugin.

    There are a number of pre-built plugins available:

      SC.ContainerView.DISSOLVE
      SC.ContainerView.FADE_COLOR
      SC.ContainerView.MOVE_IN
      SC.ContainerView.PUSH
      SC.ContainerView.REVEAL

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @property {SC.Transition}
    @default null
  */
  transition: null,

  /**
    The options for the given transition.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given transition and to see what the default options are,
    see the documentation for the transition plugin being used.

    For example, SC.ContainerView.PUSH accepts options like:

        transitionOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'linear'
        }

    @property {Object}
    @default null
  */
  transitionOptions: null,

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
      // Prevent the initial awake from transitioning in.
      this._nowShowingAlreadySet = true;
      this.nowShowingDidChange();
      delete this._nowShowingAlreadySet;
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
    var frame = this.get('frame'),
      ret = sc_super(),
      transition = this.get('transition');

    // Allow for a modified clippingFrame while transitioning.
    if (transition && this.get('isTransitioning')) {
      if (transition.transitionClippingFrame) {
        ret = transition.transitionClippingFrame(this, ret, this.get('transitionOptions'));
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
    var contentView = this.get('contentView');

    // Unregister ourself as the parent of the content and remove our internal reference to it.
    this.removeChild(contentView);
    this._currentContent = null;

    // If we created the content view, we should destroy it.
    if (this._instantiatedLastView) {
      contentView.destroy();
    }

    return sc_super();
  },

  /** @private */
  init: function () {
    sc_super();

    this._transitionCount = 0;
  },

  /** @private
    Invoked whenever the nowShowing property changes.  This will try to find
    the new content if possible and set it.  If you set nowShowing to an
    empty string or null, then the current content will be cleared.

    If you set the content manually, the nowShowing property will be set to
    SC.CONTENT_SET_DIRECTLY.
  */
  nowShowingDidChange: function () {
    // This code turns this.nowShowing into a view object by any means necessary.
    var content = this.get('nowShowing');

    // If nowShowing was changed because the content was set directly, then do nothing.
    if (content === SC.CONTENT_SET_DIRECTLY) { return; }

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
    // (Uninstantiated views have a create() method; instantiated ones do not.)
    if (SC.typeOf(content) === SC.T_CLASS) {
      if (content.kindOf(SC.CoreView)) {
        content = this.createChildView(content);
        this._instantiatedNewView = YES;
      } else {
        content = null;
      }
    }

    // If content has not been turned into a view by now, it's hopeless.
    if (content && !(content instanceof SC.CoreView)) { content = null; }

    // Sets the content.
    this.set('contentView', content);
  }.observes('nowShowing'),

  /** @private
    Replaces any child views with the passed new content.

    This method is automatically called whenever your contentView property
    changes.  You can override it if you want to provide some behavior other
    than the default.

    @param {SC.View} newContent the new content view or null.
  */
  replaceContent: function (newContent) {
    var currentContent = this._currentContent,
      currentTransition = this._currentTransition,
      options,
      self = this,
      shouldDestroyCurrentContent,
      transition = this.get('transition');

    // Take note now if we need to destroy the current contentView after it is replaced (i.e. we created it).
    shouldDestroyCurrentContent = (this._instantiatedLastView === YES);

    // Reset for next time
    this._instantiatedLastView = this._instantiatedNewView;
    this._instantiatedNewView = NO;

    if (transition && !this._nowShowingAlreadySet) {
      options = this.get('transitionOptions') || {};

      // If a transition is in progress, give the plugin a chance to cancel it.
      if (this.get('isTransitioning') && currentTransition.cancel) {
        currentTransition.cancel(this, this._lastContent, currentContent, options);
      } else {
        this.set('isTransitioning', true);
      }

      this._transitionCount++;
      if (transition.setup) {
        transition.setup(this, currentContent, newContent, options);
      }

      // Since the transition will likely rely on the setup being propagated to
      // the DOM, the only safe way is to wait a brief moment to ensure the
      // browser has updated the DOM.
      this.invokeLater(function () {

        transition.run(this, currentContent, newContent, options, function () {

          if (transition.teardown) {
            transition.teardown(self, currentContent, newContent, options);
          }
          if (shouldDestroyCurrentContent) { currentContent.destroy(); }

          self._lastContent = newContent;
          if (--self._transitionCount === 0) {
            self.set('isTransitioning', false);
          }
        });

      }, 20);
    } else {
      // The basic transition just swaps the content in place.
      if (newContent) {
        this.appendChild(newContent);
      }

      if (this.childViews.contains(currentContent)) { this.removeChild(currentContent); }
      if (shouldDestroyCurrentContent) { currentContent.destroy(); }
    }

    // Track the current view and transition (may be null).
    this._lastContent = currentContent;
    this._currentContent = newContent;
    this._currentTransition = transition;
  }

});
