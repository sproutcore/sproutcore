sc_require("views/view/base");


SC.CoreView.mixin(
  /** @scope SC.CoreView */ {

  /**
    The view has been rendered.

    Use a logical AND (single `&`) to test rendered status.  For example,

        view.get('viewState') & SC.CoreView.IS_RENDERED

    @static
    @constant
  */
  IS_RENDERED: 0x0100, // 256

  /**
    The view has been attached.

    Use a logical AND (single `&`) to test attached status.  For example,

        view.get('viewState') & SC.CoreView.IS_ATTACHED

    @static
    @constant
  */
  IS_ATTACHED: 0x0080, // 128

  /**
    The view is visible in the display.

    Use a logical AND (single `&`) to test shown status.  For example,

        view.get('viewState') & SC.CoreView.IS_SHOWN

    @static
    @constant
  */
  IS_SHOWN: 0x0040, // 64

  /**
    The view is invisible in the display.

    Use a logical AND (single `&`) to test hidden status.  For example,

        view.get('viewState') & SC.CoreView.IS_HIDDEN

    @static
    @constant
  */
  IS_HIDDEN: 0x0020, // 32

  /**
    The view has been created, but has not been rendered or attached.

    @static
    @constant
  */
  UNRENDERED: 0x0200, // 512

  /**
    The view has been created and rendered, but has not been attached
    (i.e. appended to the document).

    @static
    @constant
  */
  UNATTACHED: 0x0300, // 768

  /**
    The view has been created, rendered and attached and is visible in the
    display.

    @static
    @constant
  */
  ATTACHED_SHOWN: 0x03C0, // 960

  /**
    The view has been created, rendered and attached, but is not visible in the
    display.

    Test with & SC.CoreView.IS_HIDDEN
    @static
    @constant
  */
  ATTACHED_HIDDEN: 0x03A0, // 928

  /**
    The view has been created, rendered and attached, but is not visible in the
    display due to being hidden by a parent view.

    @static
    @constant
  */
  ATTACHED_HIDDEN_BY_PARENT: 0x03A1, // 929

  /**
    The view has been created, rendered and attached and is visible in the
    display.  It is currently transitioning according to the transitionIn
    property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_BUILDING_IN: 0x03C1, // 961

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document).

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT: 0x0381, // 897

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionOut property before being
    detached (i.e. removed from the document) because a parent view is
    being detached.

    @static
    @constant
  */
  ATTACHED_BUILDING_OUT_BY_PARENT: 0x0382, // 898

  /**
    The view has been created, rendered and attached and is visible in the
    display.  It is currently transitioning according to the transitionShow
    property before being fully shown (i.e ATTACHED_SHOWN).

    @static
    @constant
  */
  ATTACHED_SHOWING: 0x03C2, // 962

  /**
    The view has been created, rendered and attached.  It is currently
    transitioning according to the transitionHide property before being fully
    hidden.

    @static
    @constant
  */
  ATTACHED_HIDING: 0x03A2 // 930

});


SC.CoreView.reopen(
  /** @scope SC.CoreView.prototype */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /**
    The current state of the view as managed by its internal statechart.

    In order to optimize the behavior of SC.View, such as only observing display
    properties when in a rendered state or queueing updates when in a non-shown
    state, SC.View includes a simple internal statechart that maintains the
    current state of the view.

    Views have several possible states:

    * SC.CoreView.UNRENDERED
    * SC.CoreView.UNATTACHED
    * SC.CoreView.ATTACHED_SHOWN
    * SC.CoreView.ATTACHED_HIDDEN
    * SC.CoreView.ATTACHED_HIDDEN_BY_PARENT
    * SC.CoreView.ATTACHED_BUILDING_IN
    * SC.CoreView.ATTACHED_BUILDING_OUT
    * SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT
    * SC.CoreView.ATTACHED_SHOWING
    * SC.CoreView.ATTACHED_HIDING

    @type String
    @default SC.CoreView.UNRENDERED
    @readonly
  */
  viewState: SC.CoreView.UNRENDERED,

  /**
    Whether the view's layer is attached to the document or not.

    When the view's layer is attached to the document, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isAttached: function () {
    var state = this.get('viewState');
    return state & SC.CoreView.IS_ATTACHED;
  }.property('viewState').cacheable(),

  /** @private
    Whether the view's layer exists or not.

    When the view's layer is created, this value will be true.  This includes
    the unattached view state and all of the attached states.

    @field
    @type Boolean
    @default false
    @readonly
  */
  // NOTE: This property is of little value, so it's private in case we decide to toss it.
  _isRendered: function () {
    return this.get('viewState') !== SC.CoreView.UNRENDERED;
  }.property('viewState').cacheable(),

  /**
    Whether the view is fully or becoming shown or not.

    When the view is shown in the window, this value will be true.  Note that
    if the view is transitioning out or hiding, this value will still be true.

    This is not necessarily the same as `isVisible` although the two properties
    are related.  For instance, it's possible to set `isVisible` to `true` and
    still have `isVisibleInWindow` be `false` or vice versa due to the
    `isVisibleInWindow` state of the view's parent view.  Therefore,
    `isVisibleInWindow` represents the actual visible state of the view and
    `isVisible` is used to attempt to alter that state.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isVisibleInWindow: function () {
    var state = this.get('viewState');
    return state & SC.CoreView.IS_ATTACHED &&
      state !== SC.CoreView.ATTACHED_HIDDEN &&
      state !== SC.CoreView.ATTACHED_HIDDEN_BY_PARENT;
  }.property('viewState').cacheable(),

  // ------------------------------------------------------------------------
  // Actions (Locked down to the proper state)
  //


  /** @private Adopt this view action. */
  _doAdopt: function (parentView, beforeView) {
    var curParentView = this.get('parentView'),
      handled = true;

    if (curParentView && curParentView !== parentView) {
      //@if(debug)
      // This should be avoided, because using the same view instance without explicitly orphaning it first is a dangerous practice.
      SC.warn("Developer Warning: You should not adopt the view, %@, to a new parent without removing it from its old parent first.".fmt(this));
      //@endif

      // Force orphaning the view.
      this._doOrphan();
      curParentView = false;
    }

    // You can adopt childViews that have you set as their parent (i.e. created
    // with createChildView()), but have not yet been fully adopted.
    if (!curParentView || this.get('childViews').indexOf(this) < 0) {
      var idx,
        childViews = parentView.get('childViews');

      // Send notifications.
      if (parentView.willAddChild) { parentView.willAddChild(this, beforeView); }
      if (this.willAddToParent) { this.willAddToParent(parentView, beforeView); }

      // Set parentView.
      this.set('parentView', parentView);

      // Add to the new parent's childViews array.
      if (childViews.needsClone) { parentView.set(childViews = []); }
      idx = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
      if (idx < 0) { idx = childViews.length; }
      childViews.insertAt(idx, this);

      // Notify adopted.
      this._adopted(beforeView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    var state = this.get('viewState'),
      transitionIn = this.get('transitionIn');

    switch (state) {
    case SC.CoreView.ATTACHED_HIDING: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDDEN: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_IN: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT: // FAST PATH!
    case SC.CoreView.ATTACHED_SHOWING: // FAST PATH!
    case SC.CoreView.ATTACHED_SHOWN: // FAST PATH!
      //@if(debug)
      // This should be avoided, because moving the view layer without explicitly removing it first is a dangerous practice.
      SC.warn("Developer Warning: You can not attach the view, %@, to a new node without properly detaching it first.".fmt(this));
      //@endif
      return false;
    case SC.CoreView.UNRENDERED: // FAST PATH!
      return false;
    case SC.CoreView.ATTACHED_BUILDING_OUT:
      // If already building out, we need to cancel and possibly build in.
      this._callOnChildViews('_parentDidCancelBuildOut');

      // Remove the shared building out count if it exists.
      delete this._buildingOutCount;

      // Note: We can be in ATTACHED_BUILDING_OUT state without a transition out while we wait for child views.
      if (this.get('transitionOut')) {
        if (transitionIn) {
          this._transitionIn();

          // Route.
          this._gotoAttachedBuildingInState();
        } else {
          // Route first!
          this._gotoAttachedShownState();

          this._cancelTransition();
        }
      } else {

        // Route.
        this._gotoAttachedShownState();
      }

      break;
    case SC.CoreView.UNATTACHED:
      var node = this.get('layer');

      // Update before showing (note that visibility update is NOT conditional for this view).
      if (this._visibleStyleNeedsUpdate) {
        this._doUpdateVisibleStyle();
      }
      this._executeQueuedUpdates();

      // Attach to parentNode
      // IE doesn't support insertBefore(blah, undefined) in version IE9.
      parentNode.insertBefore(node, nextNode || null);

      // Notify.
      this._notifyAttached();

      // Route.
      this._routeOnAttached();

      // Give child views a chance to notify and update state.
      this._callOnChildViews('_parentDidAppendToDocument');
      break;
    default:
    }

    return true;
  },

  /** @private Destroy the layer of this view action. */
  _doDestroyLayer: function () {
    var handled = true;

    if (this.get('_isRendered') && !this.get('isAttached')) {
      // Remove our reference to the layer (our self and all our child views).
      this._executeDoDestroyLayer();
      this._callOnChildViews('_executeDoDestroyLayer');
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    var state = this.get('viewState'),
      transitionOut = this.get('transitionOut');

    switch (state) {
    case SC.CoreView.UNRENDERED: // FAST PATH!
    case SC.CoreView.UNATTACHED: // FAST PATH!
      return false;
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT: // FAST PATH!
      if (immediately) {
        // Don't wait for the build out to complete.
        this._cancelTransition();

        // Detach immediately.
        this._executeDoDetach();
      } else {
        // TODO: take ownership of the building out of self and all childviews.  Super edge case stuff here..
        this._gotoAttachedBuildingOutState();
      }

      // Don't try to notify or run transition out code again.
      return true;
    case SC.CoreView.ATTACHED_BUILDING_OUT: // FAST PATH!
      // If already building out, only cancel if immediately is set.
      if (immediately) {
        this._cancelTransition();

        // Detach immediately.
        this._executeDoDetach();
      }

      // Don't try to notify or run transition out code again.
      return true;
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
      // No need to transition out, since we're hidden.
      immediately = true;
      break;
    case SC.CoreView.ATTACHED_HIDING:
      if (immediately || !transitionOut) {
        this._cancelTransition();
      }
      break;
    case SC.CoreView.ATTACHED_BUILDING_IN:
      if (immediately || !transitionOut) {
        this._cancelTransition();
      }
      break;
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_SHOWN:
      break;
    default:
    }

      // Notify.
      this._notifyDetaching();

      if (immediately) {
      // Detach immediately.
        this._executeDoDetach();
      } else {
        // In order to allow the removal of a parent to be delayed by children's
        // transitions, we track which views are building out and finish
        // only when they're all done.
        this._buildingOutCount = 0;

      // Tell all the child views so that any with a transitionOut may run it.
        this._callOnChildViews('_parentWillBuildOutFromDocument', this);

        if (transitionOut) {
        this._transitionOut(this);

          // Route.
          this._gotoAttachedBuildingOutState();
        } else if (this._buildingOutCount > 0) {
        // Some children are building out, we will have to wait for them.
          this._gotoAttachedBuildingOutState();
        } else {
        delete this._buildingOutCount;

        // Detach immediately.
          this._executeDoDetach();
        }
      }

    return true;
  },

  /** @private Hide this view action. */
  _doHide: function () {
    var state = this.get('viewState'),
      transitionHide = this.get('transitionHide');

    switch (state) {
    case SC.CoreView.UNRENDERED: // FAST PATH!
    case SC.CoreView.UNATTACHED: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDDEN: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDING: // FAST PATH!
      return false;
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_OUT: // FAST PATH!
      // Queue the visibility update for the next time we display.
      this._visibleStyleNeedsUpdate = true;

      return true;
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT: // FAST PATH!
      // Queue the visibility update for the next time we display.
      this._visibleStyleNeedsUpdate = true;

      this._gotoAttachedHiddenState();

      return true;
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_SHOWING:
      if (!transitionHide) {
        this._cancelTransition();
      }
      break;
    case SC.CoreView.ATTACHED_SHOWN:
      break;
    default:
    }

      // Notify will hide.
      if (this.willHideInDocument) { this.willHideInDocument(); }

    if (transitionHide) {
      this._transitionHide();

      // Route.
        this._gotoAttachedHidingState();
      } else {
      // Clear out any child views that are still transitioning before we hide.
        this._callOnChildViews('_parentWillHideInDocument');

        // Note that visibility update is NOT conditional for this view.
        this._doUpdateVisibleStyle();

        // Notify.
        if (this.didHideInDocument) { this.didHideInDocument(); }

        this._callOnChildViews('_parentDidHideInDocument');

        // Route.
        this._gotoAttachedHiddenState();
      }

    return true;
  },

  /** @private Orphan this view action. */
  _doOrphan: function () {
    var parentView = this.get('parentView'),
      handled = true;

    if (parentView) {
      var childViews = parentView.get('childViews'),
        idx = childViews.indexOf(this);

      // Completely remove the view from its parent.
      this.set('parentView', null);

      // Remove view from old parent's childViews array.
      if (idx >= 0) { childViews.removeAt(idx); }

      // Notify orphaned.
      this._orphaned(parentView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Render this view action. */
  _doRender: function () {
    var handled = true;

    if (!this.get('_isRendered')) {
      // Render the layer.
      var context = this.renderContext(this.get('tagName'));
      this.renderToContext(context);
      this.set('layer', context.element());

      // Notify rendered (on self and all child views).
      this._rendered();
      this._callOnChildViews('_rendered');

      // Bypass the unattached state for adopted views.
      var parentView = this.get('parentView');
      if (parentView && parentView.get('isAttached')) {
        var parentNode = parentView.get('containerLayer'),
          siblings = parentView.get('childViews'),
          nextView = siblings.objectAt(siblings.indexOf(this) + 1),
          nextNode = (nextView) ? nextView.get('layer') : null;

        this._doAttach(parentNode, nextNode);
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Show this view action. */
  _doShow: function () {
    var state = this.get('viewState'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's current state.
      isParentShown = parentView ? parentView.get('viewState') & SC.CoreView.IS_SHOWN : true,
      transitionShow = this.get('transitionShow');

    switch (state) {
    case SC.CoreView.ATTACHED_SHOWN: // FAST PATH!
    case SC.CoreView.ATTACHED_SHOWING: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_IN: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT: // FAST PATH!
    case SC.CoreView.ATTACHED_BUILDING_OUT: // FAST PATH!
      return false;
    case SC.CoreView.UNRENDERED: // FAST PATH!
    case SC.CoreView.UNATTACHED: // FAST PATH!
      // Queue the visibility update for the next time we display.
      this._visibleStyleNeedsUpdate = true;
      return true;
    case SC.CoreView.ATTACHED_HIDDEN:
      if (isParentShown) {
        // Update before showing (note that visibility update is NOT conditional for this view).
        this._doUpdateVisibleStyle();

        // Notify will show.
        this._callOnChildViews('_parentWillShowInDocument');

        if (this.willShowInDocument) { this.willShowInDocument(); }
      } else {
        // Queue the visibility update for the next time we display.
        this._visibleStyleNeedsUpdate = true;

        // Route.
        this._gotoAttachedHiddenByParentState();

        return true;
      }
      break;
    case SC.CoreView.ATTACHED_HIDING:
      if (!transitionShow) {
        this._cancelTransition();
      }
      break;
    default:
    }

    this._executeQueuedUpdates();

    if (transitionShow) {
      this._transitionShow();

      // Route.
        this._gotoAttachedShowingState();
      } else {
        // Notify.
        if (this.didShowInDocument) { this.didShowInDocument(); }
        this._callOnChildViews('_parentDidShowInDocument');

      // Route.
        this._gotoAttachedShownState();
      }

    return true;
  },

  /** @private Update this view's contents action. */
  _doUpdateContent: function (force) {
    var isVisibleInWindow = this.get('isVisibleInWindow'),
      handled = true;

    // Legacy.
    this.set('layerNeedsUpdate', true);

    if (this.get('_isRendered')) {
      if (isVisibleInWindow || force) {
        // Only in the visible states do we allow updates without being forced.
        this._executeDoUpdateContent();
      } else {
        // Otherwise mark the view as needing an update when we enter a shown state again.
        this._contentNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private */
  _doUpdateVisibility: function () {
    if (this.get('isVisible')) {
      this._doShow();
    } else {
      this._doHide();
    }
  },

  // ------------------------------------------------------------------------
  // Events
  //

  /** @private The 'adopted' event. */
  _adopted: function (beforeView) {
    var parentView = this.get('parentView');

    if (this.get('isAttached')) {
      // Our frame may change once we've been adopted to a parent.
      this.notifyPropertyChange('frame');
    } else {

      if (this.get('_isRendered')) {

        // Bypass the unattached state for adopted views.
        if (parentView.get('isAttached')) {
          var parentNode, nextNode, nextView, siblings;

          parentNode = parentView.get('containerLayer');
          siblings = parentView.get('childViews');
          nextView = siblings.objectAt(siblings.indexOf(this) + 1);
          nextNode = (nextView) ? nextView.get('layer') : null;

          this._doAttach(parentNode, nextNode);
        }
      } else {

        // Bypass the unrendered state for adopted views.
        if (parentView.get('_isRendered')) {
          this._doRender();
        }
      }
    }

    // Notify.
    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }
  },

  /**
    This method is called by transition plugins when the incoming or showing
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.TransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionShowOptions or transitionInOptions.
  */
  didTransitionIn: function () {
    var state = this.get('viewState');

    if (state === SC.CoreView.ATTACHED_SHOWING ||
      state === SC.CoreView.ATTACHED_BUILDING_IN) {
      this._teardownTransition();

      // Notify.
      if (this.didShowInDocument) { this.didShowInDocument(); }

      if (state === SC.CoreView.ATTACHED_SHOWING) {
      this._callOnChildViews('_parentDidShowInDocument');
      }

      // Route.
      this._gotoAttachedShownState();
    }
  },

  /**
    This method is called by transition plugins when the outgoing or hiding
    transition completes.  You should only use this method if implementing a
    custom transition plugin.

    @param {SC.TransitionProtocol} transition The transition plugin used.
    @param {Object} options The original options used.  One of transitionHideOptions or transitionOutOptions.
  */
  didTransitionOut: function () {
    var state = this.get('viewState');

    if (state === SC.CoreView.ATTACHED_BUILDING_OUT) {
      this._teardownTransition();

      this._executeDoDetach();
    } else if (state === SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT) {
      var owningView = this._owningView;
      // We can't clean up the transition until the parent is done.  For
      // example, a fast child build out inside of a slow parent build out.
      owningView._buildingOutCount--;

      if (owningView._buildingOutCount === 0) {
        owningView._executeDoDetach();

        // Clean up.
        delete this._owningView;
      }
    } else if (state === SC.CoreView.ATTACHED_HIDING) {
      this._teardownTransition();

      // Clear out any child views that are transitioning before we hide.
      this._callOnChildViews('_parentWillHideInDocument');

      // Note that visibility update is NOT conditional for this view.
      this._doUpdateVisibleStyle();

      // Notify.
      if (this.didHideInDocument) { this.didHideInDocument(); }

      this._callOnChildViews('_parentDidHideInDocument');

      // Route.
      this._gotoAttachedHiddenState();
    }
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // Notify.
    if (oldParentView.didRemoveChild) { oldParentView.didRemoveChild(this); }
    if (this.didRemoveFromParent) { this.didRemoveFromParent(oldParentView); }
  },

  /** @private The 'rendered' event. */
  _rendered: function () {
    var displayProperties,
      len, idx,
      mixins = this.didCreateLayerMixin;

    // Route.
    this._gotoUnattachedState();

    // Register display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.addObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // TODO: we should be able to fix this with states
    // if (this.get('useStaticLayout')) this.viewDidResize();

    // Send notice that the layer was created.
    if (this.didCreateLayer) { this.didCreateLayer(); }
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // var childView, childViews = this.get('childViews');
    // for (var i = childViews.length - 1; i >= 0; i--) {
    //   childView = childViews[i];

    //   // We allow missing childViews in the array so ignore them.
    //   if (!childView) { continue; }

      // A parent view creating a layer might result in the creation of a
      // child view's DOM node being created via a render context without
      // createLayer() being invoked on the child.  In such cases, if anyone
      // had requested 'layer' and it was cached as null, we need to
      // invalidate it.
      // TODO: we should be able to fix this with states
      // childView.notifyPropertyChange('layer');

      // A strange case, that a childView's frame won't be correct before
      // we have a layer, if the childView doesn't have a fixed layout
      // and we are using static layout.
      // TODO: we should be able to fix this with states
      // if (this.get('useStaticLayout')) {
      //   if (!childView.get('isFixedLayout')) { childView.viewDidResize(); }
      // }

    //   childView._rendered();
    // }
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoAttachedBuildingInState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_IN);
  },

  /** @private */
  _gotoAttachedBuildingOutState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_OUT);
  },

  /** @private */
  _gotoAttachedBuildingOutByParentState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT);
  },

  /** @private */
  _gotoAttachedHiddenState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_HIDDEN);
  },

  /** @private */
  _gotoAttachedHiddenByParentState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_HIDDEN_BY_PARENT);
  },

  /** @private */
  _gotoAttachedHidingState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_HIDING);
  },

  /** @private */
  _gotoAttachedShowingState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_SHOWING);
  },

  /** @private */
  _gotoAttachedShownState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.ATTACHED_SHOWN);
  },

  /** @private */
  _gotoUnattachedState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.UNATTACHED);
  },

  /** @private */
  _gotoUnrenderedState: function () {
    // Update the state.
    this.set('viewState', SC.CoreView.UNRENDERED);
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Clear building in transition. */
  _cancelTransition: function () {
    // Cancel conflicting transitions.
    this.cancelAnimation();
    this._teardownTransition();
  },

  /** @private */
  _doUpdateVisibleStyle: function () {
    var isVisible = this.get('isVisible');

    this.$().toggleClass('sc-hidden', !isVisible);
    this.$().attr('aria-hidden', isVisible ? null : true);

    // Reset that an update is required.
    this._visibleStyleNeedsUpdate = false;
  },

  /** @private */
  _executeDoDestroyLayer: function () {
    var displayProperties,
      idx, len,
      mixins;

    // Notify.
    if (this.willDestroyLayer) { this.willDestroyLayer(); }

    mixins = this.willDestroyLayerMixin;
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // Remove the layer reference.
    this.set('layer', null);

    // Unregister display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.removeObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Route.
    this._gotoUnrenderedState();
  },

  /** @private Detach the view. */
  _executeDoDetach: function () {
    // Give child views a chance to clean up any transitions and to notify.
    this._callOnChildViews('_parentWillRemoveFromDocument');

    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Stop observing isVisible & isFirstResponder.
    this.removeObserver('isVisible', this, this._isVisibleDidChange);
    this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    // Notify.
    this._notifyDetached();

    // Give child views a chance to clean up any transitions and to notify.
    this._callOnChildViews('_parentDidRemoveFromDocument');

    // Route.
    this._gotoUnattachedState();
  },

  /** @private */
  _executeDoUpdateContent: function () {
    var mixins = this.renderMixin,
      context = this.renderContext(this.get('layer'));

    // If there is no update method, fallback to calling render with extra
    // firstTime argument set to false.
    if (!this.update) {
      this.render(context, false);
    } else {
      this.update(context.$());
    }

    // Call renderMixin methods.
    if (mixins) {
      var len = mixins.length;
      for (var idx = 0; idx < len; ++idx) {
        mixins[idx].call(this, context, false);
      }
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    context.update();

    // Legacy.
    this.set('layerNeedsUpdate', false);

    // Reset that an update is required.
    this._contentNeedsUpdate = false;

    // Notify.
    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  /** @private */
  _executeQueuedUpdates: function () {
    // Update the content of the layer if necessary.
    if (this._contentNeedsUpdate) {
      // Use the action so that it checks for the proper state.
      // this._doUpdateContent();
      this.invokeOnce(this._executeDoUpdateContent);
    }
  },

  /** @private
    Marks the view as needing a visibility update if the isVisible property
    changes.

    This observer is connected when the view is attached and is disconnected
    when the view is detached.
  */
  _isVisibleDidChange: function () {
    // Filter the input channel.
    this.invokeOnce(this._doUpdateVisibility);
  },

  /** @private
    Adds the 'focus' class to the view.

    This observer is connected when the view is attached and is disconnected
    when the view is detached.
  */
  _isFirstResponderDidChange: function () {
    var isFirstResponder = this.get('isFirstResponder');

    this.$().toggleClass('focus', isFirstResponder);
  },

  /** @private Notify on attached. */
  _notifyAttached: function () {
    // If we don't have the layout module then we don't know the frame until appended to the document.
    this.notifyPropertyChange('frame');

    // Notify.
    if (this.didAppendToDocument) { this.didAppendToDocument(); }
  },

  /** @private Notify on detaching. */
  _notifyDetaching: function () {
    if (this.willRemoveFromDocument) { this.willRemoveFromDocument(); }
  },

  /** @private Notify on detached. */
  _notifyDetached: function () {
  },

  /** @private Routes according to parent did append. */
  _parentDidAppendToDocument: function () {
    // Run any queued updates.
    this._executeQueuedUpdates();

    this._notifyAttached();
    this._routeOnAttached();
  },

  /** @private Updates according to parent did cancel build out. */
  _parentDidCancelBuildOut: function () {
    var state = this.get('viewState'),
      transitionIn = this.get('transitionIn');

    if (state === SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT) {
      if (transitionIn) {
        this._transitionIn();

        // Route.
        this._gotoAttachedBuildingInState();
      } else {
        this._cancelTransition();

        // Route.
      this._gotoAttachedShownState();
      }
    } else if (state === SC.CoreView.ATTACHED_BUILDING_OUT || state &
      SC.CoreView.IS_HIDDEN) {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private Starts building out view if appropriate. */
  _parentWillBuildOutFromDocument: function (owningView) {
    var state = this.get('viewState'),
      transitionOut = this.get('transitionOut');

    switch (state) {
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
      // There's no need to continue to further child views.
      return false;
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
    case SC.CoreView.ATTACHED_HIDING:
      // Notify.
      this._notifyDetaching();

      return false;
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_SHOWN:
      // Notify.
      this._notifyDetaching();

      if (transitionOut) {
        this._owningView = owningView;
        this._transitionOut(owningView);

        // Route.
        this._gotoAttachedBuildingOutByParentState();
      }
      return true;
    default:
    }
  },

  /** @private Clean up before parent is detached. */
  _parentWillRemoveFromDocument: function () {
    var state = this.get('viewState');

    switch (state) {
    case SC.CoreView.UNRENDERED:
    case SC.CoreView.UNATTACHED:
      // There's no need to continue to further child views.
      return false;
    case SC.CoreView.ATTACHED_BUILDING_IN:
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
      this._cancelTransition();
      break;
    case SC.CoreView.ATTACHED_HIDDEN:
    case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWN:
      break;
    default:
      // Attached and not in a transitionary state.
    }

      // Stop observing isVisible & isFirstResponder.
      this.removeObserver('isVisible', this, this._isVisibleDidChange);
      this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);
  },

  /** @private Routes according to parent did detach. */
  _parentDidRemoveFromDocument: function () {
    var state = this.get('viewState');

    if (state & SC.CoreView.IS_ATTACHED) {
      this._notifyDetached();
      this._gotoUnattachedState();
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  _parentDidHideInDocument: function () {
    var state = this.get('viewState');

    switch (state) {
    case SC.CoreView.UNRENDERED: // FAST PATH!
    case SC.CoreView.UNATTACHED: // FAST PATH!
    // case SC.CoreView.ATTACHED_BUILDING_IN:
    // case SC.CoreView.ATTACHED_SHOWING:
    // case SC.CoreView.ATTACHED_HIDING:
    // case SC.CoreView.ATTACHED_BUILDING_OUT:
    // case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_HIDDEN: // FAST PATH!
      // There's no need to continue to further child views.
      return false;
    // case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
    case SC.CoreView.ATTACHED_SHOWN:
      break;
    default:
    }

      // Notify.
    if (this.didHideInDocument) { this.didHideInDocument(); }

      // Route.
      this._gotoAttachedHiddenByParentState();
  },

  /** @private Routes according to parent will hide. */
  _parentWillHideInDocument: function () {
    var state = this.get('viewState');

    switch (state) {
    case SC.CoreView.UNRENDERED: // FAST PATH!
    case SC.CoreView.UNATTACHED: // FAST PATH!
    case SC.CoreView.ATTACHED_HIDDEN: // FAST PATH!
    // case SC.CoreView.ATTACHED_HIDDEN_BY_PARENT:
      // There's no need to continue to further child views.
      return false;
    case SC.CoreView.ATTACHED_HIDING: // FAST PATH!
      // Clear out any child views that are transitioning before we hide.
      this._callOnChildViews('_parentWillHideInDocument');

      this._cancelTransition();

      // We didn't quite hide in time so indicate that visibility needs update next time we display.
      this._visibleStyleNeedsUpdate = true;

      // Route.
      this._gotoAttachedHiddenState();

      return false;
    case SC.CoreView.ATTACHED_BUILDING_IN: // FAST PATH!
    case SC.CoreView.ATTACHED_SHOWING: // FAST PATH!
      this._cancelTransition();
      break;
    // case SC.CoreView.ATTACHED_BUILDING_OUT:
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
      this._cancelTransition();
      break;
    case SC.CoreView.ATTACHED_SHOWN:
      break;
    default:
      // Attached and not in a transitionary state.
    }

    // Notify.
    if (this.willHideInDocument) { this.willHideInDocument(); }
  },

  /** @private Routes according to parent did show. */
  _parentDidShowInDocument: function () {
    var state = this.get('viewState');

    if (state === SC.CoreView.ATTACHED_HIDDEN_BY_PARENT) {
      // Route.
      this._gotoAttachedShownState();

      // Notify.
      if (this.didShowInDocument) { this.didShowInDocument(); }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private Prepares according to parent will show. */
  _parentWillShowInDocument: function () {
    var state = this.get('viewState');

    if (state === SC.CoreView.ATTACHED_HIDDEN_BY_PARENT) {
      // Update before showing.
      if (this._visibleStyleNeedsUpdate) {
        this._doUpdateVisibleStyle();
      }

      this._executeQueuedUpdates();

      // Notify.
      if (this.willShowInDocument) { this.willShowInDocument(); }
    } else {
      // There's no need to continue to further child views.
      return false;
    }
  },

  /** @private */
  _setupTransition: function () {
    // Prepare for a transition.
    this._preTransitionLayout = SC.clone(this.get('layout'));
    this._preTransitionFrame = this.get('borderFrame');
  },

  /** @private */
  _teardownTransition: function () {
    // Reset the layout to its original value.
    this.set('layout', this._preTransitionLayout);

    // Clean up.
    delete this._preTransitionLayout;
    delete this._preTransitionFrame;
  },

  /** @private Attempts to run a transition hide, ensuring any incoming transitions are stopped in place. */
  _transitionHide: function () {
    var state = this.get('viewState'),
      transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {},
      inPlace = false;

    switch (state) {
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
      this.cancelAnimation(SC.LayoutState.CURRENT);
      inPlace = true;
      break;
    default:
      this._setupTransition();
    }

    // Set up the outgoing transition.
    if (transitionHide.setupOut) {
      transitionHide.setupOut(this, options, inPlace);
    }

    // Execute the outgoing transition.
    transitionHide.runOut(this, options, this._preTransitionLayout, this._preTransitionFrame);
  },

  /** @private Attempts to run a transition in, ensuring any outgoing transitions are stopped in place. */
  _transitionIn: function () {
    var state = this.get('viewState'),
      transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {},
      inPlace = false;

    switch (state) {
    case SC.CoreView.ATTACHED_BUILDING_OUT_BY_PARENT:
    case SC.CoreView.ATTACHED_BUILDING_OUT:
      this.cancelAnimation(SC.LayoutState.CURRENT);
      inPlace = true;
      break;
    default:
      this._setupTransition();
    }

    // Set up the incoming transition.
    if (transitionIn.setupIn) {
      transitionIn.setupIn(this, options, inPlace);
    }

    // Execute the incoming transition.
    transitionIn.runIn(this, options, this._preTransitionLayout, this._preTransitionFrame);
  },

  /** @private Attempts to run a transition out, ensuring any incoming transitions are stopped in place. */
  _transitionOut: function (owningView) {
    var state = this.get('viewState'),
      transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {},
      inPlace = false;

    switch (state) {
    case SC.CoreView.ATTACHED_SHOWING:
    case SC.CoreView.ATTACHED_HIDING:
    case SC.CoreView.ATTACHED_BUILDING_IN:
      this.cancelAnimation(SC.LayoutState.CURRENT);
      inPlace = true;
      break;
    default:
      this._setupTransition();
    }

    // Increment the shared building out count.
    owningView._buildingOutCount++;

    // Set up the outgoing transition.
    if (transitionOut.setupOut) {
      transitionOut.setupOut(this, options, inPlace);
    }

    // Execute the outgoing transition.
    transitionOut.runOut(this, options, this._preTransitionLayout, this._preTransitionFrame);
  },

  /** @private Attempts to run a transition show, ensuring any hiding transitions are stopped in place. */
  _transitionShow: function () {
    var state = this.get('viewState'),
      transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {},
      inPlace = false;

    if (state === SC.CoreView.ATTACHED_HIDING) {
      this.cancelAnimation(SC.LayoutState.CURRENT);
      inPlace = true;
    } else {
      this._setupTransition();
    }

    // Set up the outgoing transition.
    if (transitionShow.setupIn) {
      transitionShow.setupIn(this, options, inPlace);
      }

    // Execute the outgoing transition.
    transitionShow.runIn(this, options, this._preTransitionLayout, this._preTransitionFrame);
  },

  /** @private */
  _routeOnAttached: function () {
    var parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's current state.
      isParentShown = parentView ? parentView.get('viewState') & SC.CoreView.IS_SHOWN : true;

    // Begin observing isVisible & isFirstResponder.
    this.addObserver('isVisible', this, this._isVisibleDidChange);
    this.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);

    // Route.
    if (this.get('isVisible')) {
      if (isParentShown) {
        // Route.
        var transitionIn = this.get('transitionIn');
        if (transitionIn) {
          this._transitionIn();

          this._gotoAttachedBuildingInState();
        } else {
          this._gotoAttachedShownState();
        }
      } else {
        this._gotoAttachedHiddenByParentState();
      }
    } else {
      this._gotoAttachedHiddenState();
    }
  }

});
