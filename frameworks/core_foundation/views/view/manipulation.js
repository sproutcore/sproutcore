sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */{

  /**
    This code exists to make it possible to pool SC.Views. We are not going to pool SC.Views in Amber
    */
  _lastLayerId: null,

  /**
    Handles changes in the layer id.
  */
  layerIdDidChange: function() {
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
  parentViewDidChange: function() {
    this.recomputeIsVisibleInWindow() ;

    this.resetBuildState();
    this.set('layerLocationNeedsUpdate', YES) ;
    this.invokeOnce(this.updateLayerLocationIfNeeded) ;

    // We also need to iterate down through the view hierarchy and invalidate
    // all our child view's caches for 'pane', since it could have changed.
    //
    // Note:  In theory we could try to avoid this invalidation if we
    //        do this only in cases where we "know" the 'pane' value might
    //        have changed, but those cases are few and far between.

    this._invalidatePaneCacheForSelfAndAllChildViews();

    return this ;
  },

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
        len = childViews.length, idx ;

    this.notifyPropertyChange('pane');

    for (idx=0; idx<len; ++idx) {
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
  insertBefore: function(view, beforeView) {
    view.beginPropertyChanges(); // limit notifications

    // remove view from old parent if needed.  Also notify views.
    if (view.get('parentView')) { view.removeFromParent() ; }
    if (this.willAddChild) { this.willAddChild(view, beforeView) ; }
    if (view.willAddToParent) { view.willAddToParent(this, beforeView) ; }

    // set parentView of child
    view.set('parentView', this);

    // add to childView's array.
    var idx, childViews = this.get('childViews') ;
    if (childViews.needsClone) { this.set(childViews = []); }
    idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
    if (idx<0) { idx = childViews.length ; }
    childViews.insertAt(idx, view) ;

    // The DOM will need some fixing up, note this on the view.
    if(view.parentViewDidChange) view.parentViewDidChange();
    if(view.layoutDidChange) view.layoutDidChange();

    var pane = view.get('pane');
    if(pane && pane.get('isPaneAttached')) {
      view._notifyDidAppendToDocument();
    }

    // notify views
    if (this.didAddChild) { this.didAddChild(view, beforeView) ; }
    if (view.didAddToParent) { view.didAddToParent(this, beforeView) ; }

    view.endPropertyChanges();

    return this ;
  },

  removeChild: function(original, view) {
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw "%@.removeChild(%@) must belong to parent".fmt(this,view);
    }
    // notify views
    if (view.willRemoveFromParent) { view.willRemoveFromParent() ; }
    if (this.willRemoveChild) { this.willRemoveChild(view) ; }

    original(view);

    // The DOM will need some fixing up, note this on the view.
    if(view.parentViewDidChange) view.parentViewDidChange() ;

    // notify views
    if (this.didRemoveChild) { this.didRemoveChild(view); }
    if (view.didRemoveFromParent) { view.didRemoveFromParent(this) ; }

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
  replaceChild: function(view, oldView) {
    // suspend notifications
    view.beginPropertyChanges();
    oldView.beginPropertyChanges();
    this.beginPropertyChanges();

    this.insertBefore(view,oldView).removeChild(oldView) ;

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
  replaceAllChildren: function(views) {
    var len = views.get('length'), idx;

    this.beginPropertyChanges();
    this.destroyLayer().removeAllChildren();
    for(idx=0;idx<len;idx++) { this.appendChild(views.objectAt(idx)); }
    this.endPropertyChanges();

    return this ;
  },

  /**
    Appends the specified view to the end of the receivers childViews array.
    This is equivalent to calling insertBefore(view, null);

    @param view {SC.View} the view to insert
    @returns {SC.View} the receiver
  */
  appendChild: function(view) {
    return this.insertBefore(view, null);
  },

  ///
  /// BUILDING IN/OUT
  ///

  /**
    Call this to append a child while building it in. If the child is not
    buildable, this is the same as calling appendChild.
  */
  buildInChild: function(view) {
    view.willBuildInToView(this);
    this.appendChild(view);
    view.buildInToView(this);
  },

  /**
    Call to remove a child after building it out. If the child is not buildable,
    this will simply call removeChild.
  */
  buildOutChild: function(view) {
    view.buildOutFromView(this);
  },

  /**
    Called by child view when build in finishes. By default, does nothing.

  */
  buildInDidFinishFor: function(child) {
  },

  /**
    @private
    Called by child view when build out finishes. By default removes the child view.
  */
  buildOutDidFinishFor: function(child) {
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
  buildIn: function() {
    this.buildInDidFinish();
  },

  /**
    Implement this, and call didFinsihBuildOut when you are done.
  */
  buildOut: function() {
    this.buildOutDidFinish();
  },

  /**
    This should reset (without animation) any internal states; sometimes called before.

    It is usually called before a build in, by the parent view.
  */
  resetBuild: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build out;
    note that buildIn will subsequently be called, so you usually won't need to do
    anything.

    This is basically called whenever build in happens.
  */
  buildOutDidCancel: function() {

  },

  /**
    Implement this if you need to do anything special when cancelling build in.
    You probably won't be able to do anything. I mean, what are you gonna do?

    If build in was cancelled, it means build out is probably happening.
    So, any timers or anything you had going, you can cancel.
    Then buildOut will happen.
  */
  buildInDidCancel: function() {

  },

  /**
    Call this when you have built in.
  */
  buildInDidFinish: function() {
    this.isBuildingIn = NO;
    this._buildingInTo.buildInDidFinishFor(this);
    this._buildingInTo = null;
  },

  /**
    Call this when you have finished building out.
  */
  buildOutDidFinish: function() {
    this.isBuildingOut = NO;
    this._buildingOutFrom.buildOutDidFinishFor(this);
    this._buildingOutFrom = null;
  },

  /**
    Usually called by parentViewDidChange, this resets the build state (calling resetBuild in the process).
  */
  resetBuildState: function() {
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
  willBuildInToView: function(view) {
    // stop any current build outs (and if we need to, we also need to build in again)
    if (this.isBuildingOut) {
      this.buildOutDidCancel();
    }
  },

  /**
    @private (semi)
    Called by building parent view's buildInChild method.
  */
  buildInToView: function(view) {
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
  buildOutFromView: function(view) {
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
