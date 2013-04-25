sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */{

  /**
    This code exists to make it possible to pool SC.Views.
    */
  _lastLayerId: null,

  /** @private */
  init: function (original) {
    original();

    // Set up the cached layerId if it has been set on create.
    this._lastLayerId = this.get('layerId');
  }.enhance(),

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function () {
    var layer  = this.get('layer'),
        lid    = this.get('layerId'),
        lastId = this._lastLayerId;

    if (lid !== lastId) {
      // if we had an earlier one, remove from view hash.
      if (lastId && SC.View.views[lastId] === this) {
        delete SC.View.views[lastId];
      }

      // set the current one as the new old one
      this._lastLayerId = lid;

      // and add the new one
      SC.View.views[lid] = this;

      // and finally, set the actual layer id.
      if (layer) { layer.id = lid; }
    }
  }.observes("layerId"),

  /**
    This method is called whenever the receiver's parentView has changed.
    The default implementation of this method marks the view's display
    location as dirty so that it will update at the end of the run loop.

    You will not usually need to override or call this method yourself, though
    if you manually patch the parentView hierarchy for some reason, you should
    call this method to notify the view that it's parentView has changed.

    @returns {SC.View} receiver
  */
  // parentViewDidChange: function () {
  //   this.recomputeIsVisibleInWindow();

  //   this.resetBuildState();
  //   this.set('layerLocationNeedsUpdate', YES);
  //   this.invokeOnce(this.updateLayerLocationIfNeeded);

  //   // We also need to iterate down through the view hierarchy and invalidate
  //   // all our child view's caches for 'pane', since it could have changed.
  //   //
  //   // Note:  In theory we could try to avoid this invalidation if we
  //   //        do this only in cases where we "know" the 'pane' value might
  //   //        have changed, but those cases are few and far between.

  //   this._invalidatePaneCacheForSelfAndAllChildViews();

  //   return this;
  // },

  /** @private
    We want to cache the 'pane' property, but it's impossible for us to
    declare a dependence on all properties that can affect the value.  (For
    example, if our grandparent gets attached to a new pane, our pane will
    have changed.)  So when there's the potential for the pane changing, we
    need to invalidate the caches for all our child views, and their child
    views, and so on.
  */
  _invalidatePaneCacheForSelfAndAllChildViews: function () {
    var childView, childViews = this.get('childViews'),
        len = childViews.length, idx;

    this.notifyPropertyChange('pane');

    for (idx = 0; idx < len; ++idx) {
      childView = childViews[idx];
      if (childView._invalidatePaneCacheForSelfAndAllChildViews) {
        childView._invalidatePaneCacheForSelfAndAllChildViews();
      }
    }
  },

  // ..........................................................
  // LAYER LOCATION
  //

  /**
    Insert the view into the the receiver's childNodes array.

    The view will be added to the childNodes array before the beforeView.  If
    beforeView is null, then the view will be added to the end of the array.
    This will also add the view's rootElement DOM node to the receivers
    containerElement DOM node as a child.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param {SC.View} view
    @param {SC.View} beforeView
    @returns {SC.View} the receiver
  */
  insertBefore: function (view, beforeView) {
    view.beginPropertyChanges(); // limit notifications

    // Reset any views that are already building in or out.
    if (view.resetBuildState) { view.resetBuildState(); }
    view._doAdopt(this, beforeView);

    view.endPropertyChanges();

    // Make sure all notifications are delayed since the appending
    // doesn't complete until the end of the RunLoop
    // There may be better ways to do this than with invokeLast,
    // but it's the best I can do for now - PDW
    // this.invokeLast(function () {
    //   var pane = view.get('pane');
    //   if (pane && pane.get('isPaneAttached')) {
    //     view._notifyDidAppendToDocument();
    //   }
    // });

    return this;
  },

  removeChild: function (original, view) {
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw new Error("%@.removeChild(%@) must belong to parent".fmt(this, view));
    }

    // notify views
    // TODO: Deprecate these notifications.
    if (view.willRemoveFromParent) { view.willRemoveFromParent(); }
    if (this.willRemoveChild) { this.willRemoveChild(view); }

    original(view);

    return this;
  }.enhance(),

  /**
    Replace the oldView with the specified view in the receivers childNodes
    array. This will also replace the DOM node of the oldView with the DOM
    node of the new view in the receivers DOM.

    If the specified view already belongs to another parent, it will be
    removed from that view first.

    @param view {SC.View} the view to insert in the DOM
    @param view {SC.View} the view to remove from the DOM.
    @returns {SC.View} the receiver
  */
  replaceChild: function (view, oldView) {
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();

    this.insertBefore(view, oldView).removeChild(oldView);

    // resume notifications
    this.endPropertyChanges();
    oldView.endPropertyChanges();
    view.endPropertyChanges();

    return this;
  },

  /**
    Replaces the current array of child views with the new array of child
    views.

    @param {Array} views views you want to add
    @returns {SC.View} receiver
  */
  replaceAllChildren: function (views) {
    var len = views.get('length'), idx;

    this.beginPropertyChanges();
    // this._doDetach();
    this.destroyLayer().removeAllChildren();
    for (idx = 0; idx < len; idx++) { this.appendChild(views.objectAt(idx)); }
    this.replaceLayer();
    this.endPropertyChanges();

    return this;
  },

  /**
    Appends the specified view to the end of the receivers childViews array.
    This is equivalent to calling insertBefore(view, null);

    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver
  */
  appendChild: function (view) {
    return this.insertBefore(view, null);
  },

  // ..........................................................
  // TRANSITION SUPPORT
  //

  /**
    The transition plugin to use when this view is appended to a parent.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transtion in plugins available:

      SC.View.BOUNCE_IN
      SC.View.FADE_IN
      SC.View.FLIP_IN
      SC.View.MOVE_IN
      SC.View.SCALE_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionIn: null,

  /**
    The options for the given transition in plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE_IN accepts options
    like:

        transitionInOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionInOptions: null,

  /**
    The transition plugin to use when this view is removed from its parent.

    SC.View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition out plugins available:

      SC.View.BOUNCE_OUT
      SC.View.FADE_OUT
      SC.View.FLIP_OUT
      SC.View.MOVE_OUT
      SC.View.SCALE_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the SC.TransitionProtocol protocol.

    @type Object (SC.TransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionOut: null,

  /**
    The options for the given transition out plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, SC.View.MOVE_OUT accepts options
    like:

        transitionOutOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionOutOptions: null,

  ///
  /// BUILDING IN/OUT
  ///

  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.
  */
  buildInChild: function (view) {
    view.willBuildInToView(this);
    this.appendChild(view);
    view.buildInToView(this);
  },

  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.
  */
  buildOutChild: function (view) {
    view.buildOutFromView(this);
  },

  /**
    Called by child view when build in finishes. By default, does nothing.

  */
  buildInDidFinishFor: function (child) {
  },

  /**
    @private
    Called by child view when build out finishes. By default removes the child view.
  */
  buildOutDidFinishFor: function (child) {
    this.removeChild(child);
  },

  /**
    Whether the view is currently building in.
  */
  isBuildingIn: NO,

  /**
    Whether the view is currently building out.
  */
  isBuildingOut: NO,

  /**
    Implement this, and call didFinishBuildIn when you are done.
  */
  buildIn: function () {
    this.buildInDidFinish();
  },

  /**
    Implement this, and call didFinishBuildOut when you are done.
  */
  buildOut: function () {
    this.buildOutDidFinish();
  },

  /**
    This should reset (without animation) any internal states; sometimes called before.

    It is usually called before a build in, by the parent view.
  */
  resetBuild: function () {

  },

  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.

    This is basically called whenever build in happens.
  */
  buildOutDidCancel: function () {

  },

  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?

    If build in was cancelled, it means build out is probably happening.
    So, any timers or anything you had going, you can cancel.
    Then buildOut will happen.
  */
  buildInDidCancel: function () {

  },

  /**
    Call this when you have built in.
  */
  buildInDidFinish: function () {
    this.isBuildingIn = NO;
    this._buildingInTo.buildInDidFinishFor(this);
    this._buildingInTo = null;
  },

  /**
    Call this when you have finished building out.
  */
  buildOutDidFinish: function () {
    this.isBuildingOut = NO;
    this._buildingOutFrom.buildOutDidFinishFor(this);
    this._buildingOutFrom = null;
  },

  /**
    Usually called by parentViewDidChange, this resets the build state (calling resetBuild in the process).
  */
  resetBuildState: function () {
    if (this.isBuildingIn) {
      this.buildInDidCancel();
      this.isBuildingIn = NO;
    }
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
      this.isBuildingOut = NO;
    }

    // finish cleaning up
    this.buildingInTo = null;
    this.buildingOutFrom = null;

    this.resetBuild();
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method. This prepares
    to build in, but unlike buildInToView, this is called _before_ the child
    is appended.

    Mostly, this cancels any build out _before_ the view is removed through parent change.
  */
  willBuildInToView: function (view) {
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
    }
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function (view) {
    // if we are already building in, do nothing.
    if (this.isBuildingIn) { return; }

    this._buildingInTo = view;
    this.isBuildingOut = NO;
    this.isBuildingIn = YES;
    this.buildIn();
  },

  /**
    @private (semi)
    Called by building parent view's buildOutChild method.

    The supplied view should always be the parent view.
  */
  buildOutFromView: function (view) {
    // if we are already building out, do nothing.
    if (this.isBuildingOut) { return; }

    // cancel any build ins
    if (this.isBuildingIn) {
      this.buildInDidCancel();
    }

    // in any case, we need to build out
    this.isBuildingOut = YES;
    this.isBuildingIn = NO;
    this._buildingOutFrom = view;
    this.buildOut();
  }
});
