sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {

  /**
    Set to YES to indicate the view has visibility support added.
  */
  hasVisibility: YES,

  /**
    YES only if the view and all of its parent views are currently visible
    in the window.  This property is used to optimize certain behaviors in
    the view.  For example, updates to the view layer are not performed
    if the view until the view becomes visible in the window.
  */
  isVisibleInWindow: NO,

  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function() {
    return SC.CONTEXT_MENU_ENABLED;
  }.property(),

  /**
    Recomputes the isVisibleInWindow property based on the visibility of the
    view and its parent.  If the recomputed value differs from the current
    isVisibleInWindow state, this method will also call
    recomputIsVisibleInWindow() on its child views as well.  As an optional
    optimization, you can pass the isVisibleInWindow state of the parentView
    if you already know it.

    You will not generally need to call or override this method yourself. It
    is used by the SC.View hierarchy to relay window visibility changes up
    and down the chain.

    @param {Boolean} parentViewIsVisible
    @returns {SC.View} receiver
  */
  recomputeIsVisibleInWindow: function(parentViewIsVisible) {
    var previous = this.get('isVisibleInWindow'),
        current  = this.get('isVisible'),
        parentView;

    // isVisibleInWindow = isVisible && parentView.isVisibleInWindow
    // this approach only goes up to the parentView if necessary.
    if (current) {
      // If we weren't passed in 'parentViewIsVisible' (we generally aren't;
      // it's an optimization), then calculate it.
      if (parentViewIsVisible === undefined) {
        parentView = this.get('parentView');
        parentViewIsVisible = parentView ? parentView.get('isVisibleInWindow') : NO;
      }
      current = current && parentViewIsVisible;
    }

    // If our visibility has changed, then set the new value and notify our
    // child views to update their value.
    if (previous !== current) {
      this.set('isVisibleInWindow', current);

      var childViews = this.get('childViews'), len = childViews.length, idx, view;
      for(idx=0;idx<len;idx++) {
        view = childViews[idx];
        if(view.recomputeIsVisibleInWindow) { view.recomputeIsVisibleInWindow(current); }
      }

      // For historical reasons, we'll also layout the child views if
      // necessary.
      if (current) {
        if (this.get('childViewsNeedLayout')) { this.invokeOnce(this.layoutChildViewsIfNeeded); }
      }
      else {
        // Also, if we were previously visible and were the first responder,
        // resign it.  This more appropriately belongs in a
        // 'isVisibleInWindow' observer or some such helper method because
        // this work is not strictly related to computing the visibility, but
        // view performance is critical, so avoiding the extra observer is
        // worthwhile.
        if (this.get('isFirstResponder')) { this.resignFirstResponder(); }
      }
    }

    // If we're in this function, then that means one of our ancestor views
    // changed, or changed its 'isVisibleInWindow' value.  That means that if
    // we are out of sync with the layer, then we need to update our state
    // now.
    //
    // For example, say we're isVisible=NO, but we have not yet added the
    // 'sc-hidden' class to the layer because of the "don't update the layer if
    // we're not visible in the window" check.  If any of our parent views
    // became visible, our layer would incorrectly be shown!
    this.updateLayerIfNeeded(YES);

    return this;
  },


  /** @private
    Whenever the view's visibility changes, we need to recompute whether it is
    actually visible inside the window (a view is only visible in the window
    if it is marked as visibile and its parent view is as well), in addition
    to updating the layer accordingly.
  */
  _sc_isVisibleDidChange: function() {
    // 'isVisible' is effectively a displayProperty, but we'll call
    // displayDidChange() manually here instead of declaring it as a
    // displayProperty because that avoids having two observers on
    // 'isVisible'.  A single observer is:
    //   a.  More efficient
    //   b.  More correct, because we can guarantee the order of operations
    this.displayDidChange();

    this.recomputeIsVisibleInWindow();
  }.observes('isVisible')
})
