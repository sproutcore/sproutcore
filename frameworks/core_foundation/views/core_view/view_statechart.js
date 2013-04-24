sc_require("views/view");


SC.CoreView.reopen(
  /** @scope SC.CoreView */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /** @private
    Possible states:

    * unrendered
    * unattached
    * attached (wrapper state)
    ** attached_shown
    ** attached_building_in
    ** attached_building_out
    ** attached_hiding
    ** attached_hidden
    ** attached_showing

    @type String
    @default 'unrendered'
    @readonly
  */
  _state: 'unrendered',

  /**
    Whether the view's layer is attached to the DOM or not.

    When the view's layer is attached to the DOM, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isAttached: function () {
    var state = this.get('_state');
    return state.indexOf('attached') === 0;
  }.property('_state').cacheable(),

  /**
    Whether the attached view is invisible or becoming invisible.

    When the view is hidden in the window, this value will be true.  Note that
    this only applies to rendered and attached views and if the view is
    transitioning in, this value will be false.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isHidden: function () {
    var state = this.get('_state');
    return state === 'attached_hidden' || state === 'attached_hiding';
  }.property('_state').cacheable(),

  /**
    Whether the view's layer exists or not.

    When the view's layer is created, this value will be true.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isRendered: function () {
    var state = this.get('_state');
    return state !== 'unrendered';
  }.property('_state').cacheable(),

  /**
    Whether the attached view is shown or becoming shown.

    When the view is shown in the window, this value will be true.  Note that
    this only applies to rendered and attached views and if the view is
    transitioning out, this value will be false.

    This is not necessarily the same as `isVisible` although the two properties
    are related.  For instance, it's possible to set `isVisible` to `true` and still
    have `isShown` be `false` or vice versa due to the `isShown` state of the view's
    parent view.  Therefore, `isShown` represents the actual visible state of the
    view and `isVisible` is used to attempt to alter that state.

    @field
    @type Boolean
    @default false
    @readonly
  */
  isShown: function () {
    var state = this.get('_state');
    return state === 'attached_shown' || state === 'attached_showing' ||  state === 'attached_building_in';
  }.property('_state').cacheable(),

  // ------------------------------------------------------------------------
  // Actions (Locked down to the proper state)
  //

  /** @private Adopt this view action. */
  _doAdopt: function (parentView, beforeView) {
    console.log('%@:%@ - _doAdopt'.fmt(this, this.get('_state')));
    var curParentView = this.get('parentView'),
      handled = true;

    if (curParentView && curParentView !== parentView) {
      //@if(debug)
      // This should be avoided, because using the same view instance without explicitly orphaning it first is a dangerous practice.
      SC.warn("Developer Warning: You should not adopt the view %@ to a new parent without removing it from its old parent first.".fmt(this));
      //@endif

      // Force orphaning the view.
      this._executeDoOrphan();
      curParentView = false;
    }

    if (!curParentView) {
      this._executeDoAdopt(parentView, beforeView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    console.log('%@:%@ - _doAttach'.fmt(this, this.get('_state')));
    var state = this.get('_state'),
      handled = true;

    if (state === 'unattached') {
      this._executeDoAttach(parentNode, nextNode);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Orphan this view action. */
  _doDestroyLayer: function () {
    console.log('%@:%@ - _doDestroyLayer'.fmt(this, this.get('_state')));
    var isRendered = this.get('isRendered'),
      handled = true;

    if (isRendered) {
      this._executeDoDestroyLayer();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    console.log('%@:%@ - _doDetach'.fmt(this, this.get('_state')));
    var isAttached = this.get('isAttached'),
      isShown = this.get('isShown'),
      transitionOut = this.get('transitionOut'),
      handled = true;

    if (isAttached) {
      if (isShown && transitionOut && !immediately) {
        // In the shown states, attempt to build out unless told otherwise.
        this._gotoBuildingOutState();
      } else {
        this._executeDoDetach();
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Hide this view action. */
  _doHide: function () {
    console.log('%@ - _doHide'.fmt(this));
    var isShown = this.get('isShown'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true,
      transitionHide = this.get('transitionShow'),
      handled = true;

    if (isShown && isParentShown) {
      this._executeDoUpdateVisibility();

      if (transitionHide) {
        this._gotoHidingState();
      } else {
        this._gotoHiddenState();
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Orphan this view action. */
  _doOrphan: function () {
    console.log('%@:%@ - _doOrphan'.fmt(this, this.get('_state')));
    var parentView = this.get('parentView'),
      handled = true;

    if (parentView) {
      this._executeDoOrphan();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Render this view action. */
  _doRender: function () {
    console.log('%@.%@ - _doRender'.fmt(this, this.get('_state')));
    var isRendered = this.get('isRendered'),
      handled = true;

    if (!isRendered) {
      this._executeDoRender();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Show this view action. */
  _doShow: function () {
    console.log('%@:%@ - _doShow'.fmt(this, this.get('_state')));
    var isHidden = this.get('isHidden'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true,
      transitionShow = this.get('transitionShow'),
      handled = true;

    // Note that showing may not actually "show" anything if the parent is not visible, but it will
    // put the child in the correct state.
    if (isHidden && isParentShown) {
      // this.set('isVisibleInWindow', this.get('isVisible') && this.getPath('parentView.isVisibleInWindow'));
      if (this._contentNeedsUpdate) {
        this._executeDoUpdate();
      }
      if (this._layoutNeedsUpdate) {
        this._executeDoUpdateLayout();
      }
      // if (this._visibilityNeedsUpdate) {
      this._executeDoUpdateVisibility();
      // }

      if (transitionShow) {
        this._gotoShowingState();
      } else {
        this._gotoShownState();
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Update this view's contents action. */
  _doUpdateContent: function (force) {
    // console.log('%@:%@ - _doUpdateContent'.fmt(this, this.get('_state')));
    var isRendered = this.get('isRendered'),
      state = this.get('_state'),
      handled = true;

    if (isRendered) {
      if (state === 'attached_shown' || force) {
        // Only in the attached_shown state do we allow updates without being forced.
        this._executeDoUpdate();
      } else {
        // Otherwise mark the view as needing an update when we enter the attached_shown state again.
        this._contentNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Update this view's layout action. */
  _doUpdateLayout: function (force) {
    console.log('%@:%@ - _doUpdateLayout'.fmt(this, this.get('_state')));
    var isRendered = this.get('isRendered'),
      state = this.get('_state'),
      handled = true;

    if (isRendered) {
      if (state === 'attached_shown' || force) {
        // Only in the attached_shown state do we allow updates without being forced.
        this._executeDoUpdate();
      } else {
        // Otherwise mark the view as needing an update when we enter the attached_shown state again.
        this._layoutNeedsUpdate = true;
      }
    } else {
      handled = false;
    }

    return handled;
  },

  // ------------------------------------------------------------------------
  // Events
  //

  /** @private The 'adopted' event. */
  _adopted: function (beforeView) {
    // console.log("    %@:%@ - adopted".fmt(this, this.get('_state')));
    var parentView = this.get('parentView');

    // Notify.
    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }

    if (this.get('isRendered')) {
      // Bypass the unattached state for adopted views.
      if (parentView.get('isAttached')) {
        var parentNode, nextNode, nextView, siblings;

        parentNode = parentView.get('containerLayer');
        siblings = parentView.get('childViews');
        nextView = siblings.objectAt(siblings.indexOf(this) + 1);
        nextNode = (nextView) ? nextView.get('layer') : null;

        this._executeDoAttach(parentNode, nextNode);
      }
    } else {
      // Bypass the unrendered state for adopted views.
      if (parentView.get('isRendered')) {
        this._executeDoRender();
      }
    }
  },

  /** @private The 'attached' event. */
  _attached: function () {
    // Route.
    // this._route('_attached');
    // console.log('%@ - attached'.fmt(this));
    // Update the isVisibleInWindow property (Note that this function recurses).
    // this.set('isVisibleInWindow', this.get('isVisible') && this.getPath('parentView.isVisibleInWindow'));

    // Notify.
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    if (this.didAppendToDocument) { this.didAppendToDocument(); }

    // Route.
    var isVisible = this.get('isVisible'),
      parentView = this.get('parentView'),
      // Views without a parent are not limited by a parent's isShown property.
      isParentShown = parentView ? parentView.get('isShown') : true,
      transitionIn = this.get('transitionIn');

    // console.log("    %@:%@ - attached (isVisible: %@, isParentShown: %@, transitionIn: %@)".fmt(this, this.get('_state'), isVisible, isParentShown, transitionIn));
    if (isVisible && isParentShown) { // isVisibleInWindow
      if (this._contentNeedsUpdate) {
        this._executeDoUpdate();
      }
      if (this._layoutNeedsUpdate) {
        this._executeDoUpdateLayout();
      }
      if (this._visibilityNeedsUpdate) {
        this._executeDoUpdateVisibility();
      }

      // this._cascadeShowStateToChildViews
      if (transitionIn) {
        this._gotoBuildingInState();
      } else {
        this._gotoShownState();
      }
    } else {
      this._gotoHiddenState();
    }

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_attached');
  },

  /** @private The 'builtIn' event. */
  _builtIn: function () {
    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    // Clean up the transition if the plugin supports it.
    if (!!transitionIn.teardown) {
      transitionIn.teardown(this, options);
    }

    this._gotoShownState();
  },

  /** @private The 'builtOut' event. */
  _builtOut: function () {
    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    // Clean up the transition if the plugin supports it.
    if (!!transitionOut.teardown) {
      transitionOut.teardown(this, options);
    }

    this._executeDoDetach();
  },

  /** @private The 'detached' event. */
  _detached:  function () {
    //Route.
    this._gotoUnattachedState();

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_detached');
  },

  /** @private The 'detaching' event. */
  _detaching:  function () {
    if (this.willRemoveFromDocument) { this.willRemoveFromDocument(); }

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_detaching');
  },

  /** @private The 'hidden' event. */
  _hidden: function () {
    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    // Clean up the transition if the plugin supports it.
    if (!!transitionHide.teardown) {
      transitionHide.teardown(this, options);
    }

    this._gotoHiddenState();
  },

  /** @private The 'layerDestroyed' event. */
  _layerDestroyed: function () {
    var displayProperties,
      idx, len;

    // Unregister display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.removeObserver(displayProperties[idx], this, this.displayDidChange);
    }

    // Route.
    this._gotoUnrenderedState();

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_layerDestroyed');
  },

  /** @private The 'layerDestroying' event. */
  _layerDestroying: function () {
    // Notify.
    if (this.willDestroyLayer) { this.willDestroyLayer(); }
    var mixins = this.willDestroyLayerMixin, len, idx;
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this);
      }
    }

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_layerDestroying');
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // console.log('%@ - orphaned'.fmt(this));
    // Notify.
    if (oldParentView.didRemoveChild) { oldParentView.didRemoveChild(this); }
    if (this.didRemoveFromParent) { this.didRemoveFromParent(oldParentView); }

    // The DOM will need some fixing up, note this on the view.
    // But don't update the layer location if it's already destroyed (i.e. it
    // no longer has a layer), because if a new layer with the same id were
    // created before updateLayerLocationIfNeeded runs, we would inadvertently
    // remove the new layer.
    // TODO: We should be able to avoid this hack with statechart.
    // if (!this.get('isDestroyed') && this.parentViewDidChange) this.parentViewDidChange();
  },

  /** @private The 'rendered' event. */
  _rendered: function () {
    // console.log("    %@:%@ - rendered".fmt(this, this.get('_state')));
    var displayProperties,
      len, idx,
      mixins = this.didCreateLayerMixin;

    // TODO: we should be able to fix this with states
    // this.notifyPropertyChange('layer');

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

    // Register display property observers.
    displayProperties = this.get('displayProperties');
    for (idx = 0, len = displayProperties.length; idx < len; idx++) {
      this.addObserver(displayProperties[idx], this, this.displayDidChange);
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

    // Route.
    this._gotoUnattachedState();

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_rendered');

    // Bypass the unattached state for adopted views.
    var parentView = this.get('parentView');
    if (parentView && parentView.get('isAttached')) {
      var parentNode = parentView.get('containerLayer'),
        siblings = parentView.get('childViews'),
        nextView = siblings.objectAt(siblings.indexOf(this) + 1),
        nextNode = (nextView) ? nextView.get('layer') : null;

      this._executeDoAttach(parentNode, nextNode);
    }
  },

  /** @private The 'shown' event. */
  _shown: function () {
    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    // Clean up the transition if the plugin supports it.
    if (!!transitionShow.teardown) {
      transitionShow.teardown(this, options);
    }

    // Route.
    this._gotoShownState();
  },

  /** @private The 'updatedContent' event. */
  _updatedContent: function () {
    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) { this.viewDidResize(); }

    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  /** @private The 'updatedLayout' event. */
  _updatedLayout: function () {
    // Notify.
    this.didRenderAnimations();

    // If this view uses static layout, then notify if the frame changed.
    // (viewDidResize will do a comparison)
    if (this.useStaticLayout) this.viewDidResize();

    // Cascade the event to child views.
    this._cascadeEventToChildViews('_updatedLayout');
  },

  /** @private The 'updatedVisibility' event. */
  _updatedVisibility: function () {
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoBuildingInState: function () {
    // Update the state.
    this.set('_state', 'attached_building_in');

    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionIn.setup) {
      transitionIn.setup(this, options);
    }

    // Execute the transition.
    transitionIn.run(this, options);
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoBuildingOutState: function () {
    // Update the state.
    this.set('_state', 'attached_building_out');

    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionOut.setup) {
      transitionOut.setup(this, options);
    }

    // Execute the transition.
    transitionOut.run(this, options);
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoHiddenState: function () {
    // Update the state.
    this.set('_state', 'attached_hidden');
    // this._cascadeStateToChildViews();
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoHidingState: function () {
    // Update the state.
    this.set('_state', 'attached_hiding');

    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionHide.setup) {
      transitionHide.setup(this, options);
    }

    // Execute the transition.
    transitionHide.run(this, options);
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoShowingState: function () {
    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionShow.setup) {
      transitionShow.setup(this, options);
    }

    // Execute the transition.
    transitionShow.run(this, options);

    // Update the state.
    this.set('_state', 'attached_showing');
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoUnattachedState: function () {
    // Update the state.
    this.set('_state', 'unattached');
    // this._cascadeStateToChildViews();
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoUnrenderedState: function () {
    // Update the state.
    this.set('_state', 'unrendered');
    // this._cascadeStateToChildViews();
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  /** @private */
  _gotoShownState: function () {
    // Update the state.
    this.set('_state', 'attached_shown');
    // console.log("%@:%@".fmt(this, this.get('_state')));
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Send the 'event' (i.e. call the method recursively on all child views). */
  _cascadeEventToChildViews: function (eventName) {
    var args,
      childView, childViews = this.get('childViews'),
      method;

    args = SC.$A(arguments).slice(1);
    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      method = childView[eventName];
      method.apply(childView, args);
    }
  },

  /** @private Update the state for all childViews */
  _cascadeStateToChildViews: function () {
    var childView, childViews = this.get('childViews'),
      state = this.get('_state');

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      childView.set('_state', state);

      // Recurse through all possible child views.
      childView._cascadeStateToChildViews();
    }
  },

  /** @private */
  _executeDoAdopt: function (parentView, beforeView) {
    console.log("  %@:%@ - _executeDoAdopt".fmt(this, this.get('_state')));
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

    // The DOM will need some fixing up, note this on the view.
    // if (this.parentViewDidChange) this.parentViewDidChange();
    // if (this.layoutDidChange) this.layoutDidChange();

    // Notify adopted.
    this._adopted(beforeView);
  },

  /** @private */
  _executeDoAttach: function (parentNode, nextNode) {
    console.log("  %@:%@ - _executeDoAttach".fmt(this, this.get('_state')));
    var node = this.get('layer');

      // before we add to parent node, make sure that the nextNode exists...
      // if (nextView && (!nextNode || nextNode.parentNode!==parentNode)) {
      //   nextView.updateLayerLocationIfNeeded();

      //   // just in case it still couldn't generate the layer, force to null, because
      //   // IE doesn't support insertBefore(blah, undefined) in version IE9.
      //   nextNode = nextView.get('layer') || null;
      // }

      // add to parentNode if needed.
      // if ((node.parentNode !== parentNode) || (node.nextSibling !== nextNode)) {
    // jQuery(elem).append(layer)
    parentNode.insertBefore(node, nextNode);
    // }

    // Notify attached.
    this._attached();
  },

  /** @private */
  _executeDoDestroyLayer: function () {
    // Notify destroying layer.
    this._layerDestroying();

    // Destroy the layer and remove.
    var layer = this.get('layer');
    layer.parentNode.removeChild(layer);
    this.set('layer', null);

    // Notify layer destroyed.
    this._layerDestroyed();
  },

  /** @private */
  _executeDoDetach: function () {
    // Notify detaching.
    this._detaching();

    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Notify detached.
    this._detached();
  },

  /** @private */
  _executeDoOrphan: function () {
    var parentView = this.get('parentView'),
      childViews = parentView.get('childViews'),
      idx = childViews.indexOf(this);

    // Completely remove the view from its parent.
    this.set('parentView', null);

    // Remove view from old parent's childViews array.
    if (idx >= 0) { childViews.removeAt(idx); }

    // Notify orphaned.
    this._orphaned(parentView);

    // Route.
    // if (this.get('isRendered')) {
    //   if (this.get('isAttached')) {
    //     this._gotoAttachedOrphanState();
    //   } else {
    //     this._gotoUnattachedOrphanState();
    //   }
    // } else {
    //   this._gotoUnrenderedOrphanState();
    // }
  },

  /** @private */
  _executeDoRender: function () {
    console.log("  %@:%@ - _executeDoRender".fmt(this, this.get('_state')));
    // Render the layer.
    this.createLayer();

    // Notify rendered.
    this._rendered();
  },

  /** @private */
  _executeDoUpdate: function () {
    var mixins = this.renderMixin, idx, len,
      context = this.renderContext(this.get('layer'));

    // TODO: this is too brute force, updates everything...
    this._renderLayerSettings(context, false);

    // If there is no update method, fallback to calling render with extra
    // firstTime argument set to false.
    if (!this.update) {
      this.render(context, false);
    } else {
      this.update(context.$());
    }

    // Call renderMixin methods.
    if (mixins) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) {
        mixins[idx].call(this, context, false);
      }
    }

    context.update();
    // if (context._innerHTMLReplaced) {
    //   var pane = this.get('pane');
    //   if (pane && pane.get('isPaneAttached')) {
    //     this._notifyDidAppendToDocument();
    //   }
    // }

    // Reset that an update is required.
    this._contentNeedsUpdate = false;

    // TODO: Deprecate layerNeedsUpdate and remove this.
    this.set('layerNeedsUpdate', NO);

    // Notify updated.
    this._updatedContent();
  },

  /** @private */
  _executeDoUpdateLayout: function () {
    var context = this.renderContext(this.get('layer'));

    context.setStyle(this.get('layoutStyle'));
    context.update();

    // Reset that an update is required.
    this._layoutNeedsUpdate = false;

    // Notify updated.
    this._updatedLayout();
  },

  /** @private */
  _executeDoUpdateVisibility: function () {
    var context = this.renderContext(this.get('layer'));
    context.setClass('sc-hidden', this.get('isVisible'));
    context.update();

    // Reset that an update is required.
    this._visibilityNeedsUpdate = false;

    // Notify updated.
    this._updatedVisibility();
  },

});

SC.CoreView.prototype.displayDidChange = SC.CoreView.prototype._doUpdateContent;
