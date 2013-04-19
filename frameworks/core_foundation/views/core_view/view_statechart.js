sc_require("views/view");


SC.CoreView.reopen(
  /** @scope SC.CoreView */ {

  // ------------------------------------------------------------------------
  // Properties
  //

  /** @private */
  _parentIsHidden: true,

  /** @private
    Possible states:

    * unrendered_orphan
    * unattached_orphan
    * unrendered_child
    * unattached_child
    * attached (wrapper state)
    ** attached_shown
    ** attached_building_in
    ** attached_building_out
    ** attached_hiding
    ** attached_hidden
    ** attached_showing

    @type String
    @default 'unrendered_orphan'
  */
  _state: 'unrendered_orphan',

  /**
    Whether the view has a parent or not.

    When the view has a parent view, this value will be true.

    @field
    @type Boolean
    @default false
  */
  isAdopted: function () {
    var state = this.get('_state');
    return state !== 'unrendered_orphan' && state !== 'unattached_orphan';
  }.property('_state').cacheable(),

  /**
    Whether the view's layer is attached to the DOM or not.

    When the view's layer is attached to the DOM, this value will be true.

    @field
    @type Boolean
    @default false
  */
  isAttached: function () {
    var state = this.get('_state');
    return state.indexOf('attached') === 0;
  }.property('_state').cacheable(),

  /**
    Whether the attached view is invisible or becoming invisible.

    When the view is hidden in the window, this value will be true.  Note that
    this only applies to rendered and attached views.  If the view is
    transitioning in, this value will be false.

    @field
    @type Boolean
    @default false
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
  */
  isRendered: function () {
    var state = this.get('_state');
    return state === 'unattached_orphan' || state === 'unattached_child' || this.get('isAttached');
  }.property('_state').cacheable(),

  /**
    Whether the attached view is visible or becoming visible.

    When the view is shown in the window, this value will be true.  Note that
    this only applies to rendered and attached views.  If the view is
    transitioning out, this value will be false.

    @field
    @type Boolean
    @default false
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
    console.log('%@ - _doAdopt'.fmt(this));
    var curParentView = this.get('parentView'),
      isAdopted = this.get('isAdopted'),
      handled = true;

    if (isAdopted && parentView !== curParentView) {
      //@if(debug)
      // This should be avoided, because using the same view instance without explicitly orphaning it first is a dangerous practice.
      SC.warn("Developer Warning: You should not adopt the view %@ to a new parent without removing it from its old parent first.".fmt(this));
      //@endif

      // Force orphaning the view.
      isAdopted = !this._doOrphan(true);
    }

    if (!isAdopted) {
      // Send notifications.
      if (parentView.willAddChild) { parentView.willAddChild(this, beforeView); }
      if (this.willAddToParent) { this.willAddToParent(parentView, beforeView); }

      this._gotoAdoptingState(parentView, beforeView);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Attach this view action. */
  _doAttach: function (parentNode, nextNode) {
    console.log('%@ - _doAttach'.fmt(this));
    var isAttached = this.get('isAttached'),
      isRendered = this.get('isRendered'),
      // state = this.get('_state'),
      handled = true;

    if (isRendered && !isAttached) {
      this._gotoAttachingState(parentNode, nextNode);
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Orphan this view action. */
  _doDestroyLayer: function () {
    console.log('%@ - _doDestroyLayer'.fmt(this));
    var isRendered = this.get('isRendered'),
      handled = true;

    if (isRendered) {
      this._gotoDestroyingLayerState();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Detach this view action. */
  _doDetach: function (immediately) {
    console.log('%@ - _doDetach'.fmt(this));
    var isAttached = this.get('isAttached'),
      isShown = this.get('isShown'),
      transitionOut = this.get('transitionOut'),
      handled = true;

    if (isAttached) {
      if (isShown && transitionOut && !immediately) {
        // In the shown states, attempt to build out unless told otherwise.
        this._gotoBuildingOutState();
      } else {
        this._gotoDetachingState();
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
      transitionHide = this.get('transitionShow'),
      handled = true;

    if (isShown) {
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
    console.log('%@ - _doOrphan'.fmt(this));
    var isAdopted = this.get('isAdopted'),
      handled = true;

    if (isAdopted) {
      this._gotoOrphaningState();
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
      this._gotoRenderingState();
    } else {
      handled = false;
    }

    return handled;
  },

  /** @private Show this view action. */
  _doShow: function () {
    console.log('%@ - _doShow'.fmt(this));
    var isHidden = this.get('isHidden'), // isAdopted = this.get('isAdopted'),
      transitionShow = this.get('transitionShow'),
      handled = true;

    // Note that showing may not actually "show" anything if the parent is not visible, but it will
    // put the child in the correct state.
    if (isHidden) { //  && !this.get('_parentIsHidden')  // && !isAdopted || (isAdopted && this.getPath('parentView.isVisibleInWindow'))
      // this.set('isVisibleInWindow', this.get('isVisible') && this.getPath('parentView.isVisibleInWindow'));
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

  /** @private Update this view action. */
  _doUpdate: function (force) {
    console.log('%@ - _doUpdate'.fmt(this));
    var isRendered = this.get('isRendered'),
      state = this.get('_state'),
      handled = true;

    if (isRendered) {
      if (state === 'attached_shown' || force) {
        // Only in the attached_shown state do we allow updates without being forced.
        this._gotoUpdatingState();
      } else {
        // Otherwise mark the view as needing an update when we enter the attached_shown state again.
        this._updateOnShown = true;
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
    // console.log('%@ - adopted'.fmt(this));
    var parentView = this.get('parentView');

    if (parentView.didAddChild) { parentView.didAddChild(this, beforeView); }
    if (this.didAddToParent) { this.didAddToParent(parentView, beforeView); }

    this._cascadeEventToChildViews('_adopted', beforeView);
  },

  /** @private The 'attached' event. */
  _attached: function () {
    // console.log('%@ - attached'.fmt(this));
    // Update the isVisibleInWindow property (Note that this function recurses).
    // this.set('isVisibleInWindow', this.get('isVisible') && this.getPath('parentView.isVisibleInWindow'));

    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    if (this.didAppendToDocument) { this.didAppendToDocument(); }

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

    this._gotoDetachedState();
  },

  /** @private The 'detached' event. */
  _detached:  function () {
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

    this._cascadeEventToChildViews('_layerDestroyed');
  },

  /** @private The 'orphaned' event. */
  _orphaned: function (oldParentView) {
    // console.log('%@ - orphaned'.fmt(this));
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
    // console.log('%@ - rendered'.fmt(this));
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

    this._cascadeEventToChildViews('_rendered');
  },

  /** @private The 'shown' event. */
  _shown: function () {
    var transitionShow = this.get('transitionShow'),
      options = this.get('transitionShowOptions') || {};

    // Clean up the transition if the plugin supports it.
    if (!!transitionShow.teardown) {
      transitionShow.teardown(this, options);
    }

    this._gotoShownState();
  },

  /** @private The 'updated' event. */
  _updated: function () {
    // If this view uses static layout, then notify that the frame (likely)
    // changed.
    if (this.useStaticLayout) { this.viewDidResize(); }

    if (this.didUpdateLayer) { this.didUpdateLayer(); }

    if (this.designer && this.designer.viewDidUpdateLayer) {
      this.designer.viewDidUpdateLayer(); //let the designer know
    }
  },

  // ------------------------------------------------------------------------
  // States
  //

  /** @private */
  _gotoAdoptingState: function (parentView, beforeView) {
    var idx,
      childViews = parentView.get('childViews');

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

    // Route.
    if (this.get('isRendered')) {
      if (parentView.get('isAttached')) {
        // Bypass the unattached_child state.
        this.set('_state', 'unattached_child');

        var parentNode, nextNode, nextView, siblings;

        parentNode = parentView.get('containerLayer');
        siblings = parentView.get('childViews');
        nextView = siblings.objectAt(siblings.indexOf(this) + 1);
        nextNode = (nextView) ? nextView.get('layer') : null;
        this._gotoAttachingState(parentNode, nextNode);
      } else {
        this._gotoUnattachedChildState();
      }
    } else {
      if (parentView.get('isRendered')) {
        // Bypass the unrendered_child state.
        this.set('_state', 'unrendered_child');
        this._gotoRenderingState();
      } else {
        this._gotoUnrenderedChildState();
      }
    }
  },

  /** @private */
  _gotoAttachingState: function (parentNode, nextNode) {
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

    // Route.
    var isVisible = this.get('isVisible'),
      // isVisibleInWindow = this.getPath('parentView.isVisibleInWindow'),
      transitionIn = this.get('transitionIn');

    if (isVisible) { // isVisibleInWindow
      if (transitionIn) {
        this._gotoBuildingInState();
      } else {
        this._gotoShownState();
      }
    } else {
      this._gotoHiddenState();
    }
  },

  /** @private */
  _gotoBuildingInState: function () {
    var transitionIn = this.get('transitionIn'),
      options = this.get('transitionInOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionIn.setup) {
      transitionIn.setup(this, options);
    }

    // Execute the transition.
    transitionIn.run(this, options);

    // Update the state.
    this.set('_state', 'attached_building_in');
  },

  /** @private */
  _gotoBuildingOutState: function () {
    var transitionOut = this.get('transitionOut'),
      options = this.get('transitionOutOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionOut.setup) {
      transitionOut.setup(this, options);
    }

    // Execute the transition.
    transitionOut.run(this, options);

    // Update the state.
    this.set('_state', 'attached_building_out');
  },

  /** @private */
  _gotoHiddenState: function () {
    // Update the state.
    this.set('_state', 'attached_hidden');
    // this._cascadeStateToChildViews();
  },

  /** @private */
  _gotoHidingState: function () {
    var transitionHide = this.get('transitionHide'),
      options = this.get('transitionHideOptions') || {};

    // Prep the transition if the plugin supports it.
    if (!!transitionHide.setup) {
      transitionHide.setup(this, options);
    }

    // Execute the transition.
    transitionHide.run(this, options);

    // Update the state.
    this.set('_state', 'attached_hiding');
  },

  /** @private */
  _gotoDestroyingLayerState: function () {
    // Destroy the layer.
    this.set('layer', null);

    // Notify layer destroyed.
    this._layerDestroyed();

    //Route.
    if (this.get('isAdopted')) {
      this._gotoUnrenderedChildState();
    } else {
      this._gotoUnrenderedOrphanState();
    }
  },

  /** @private */
  _gotoDetachingState: function () {
    // Detach the layer.
    var node = this.get('layer');
    node.parentNode.removeChild(node);

    // Notify detached.
    this._detached();

    //Route.
    if (this.get('isAdopted')) {
      this._gotoUnattachedChildState();
    } else {
      this._gotoUnattachedOrphanState();
    }
  },

  /** @private */
  _gotoOrphaningState: function () {
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
    if (this.get('isRendered')) {
      if (this.get('isAttached')) {
        this._gotoAttachedOrphanState();
      } else {
        this._gotoUnattachedOrphanState();
      }
    } else {
      this._gotoUnrenderedOrphanState();
    }
  },

  /** @private */
  _gotoRenderingState: function () {
    // Render the layer.
    this.createLayer();

    // Notify rendered.
    this._rendered();

    // Route.
    var isAdopted = this.get('isAdopted');
    if (isAdopted) {
      var parentView = this.get('parentView'),
        parentNode,
        nextNode,
        nextView,
        siblings;

      if (parentView.get('isAttached')) {
        // Bypass the unattached_child state.
        this.set('_state', 'unattached_child');

        parentNode = parentView.get('containerLayer');
        siblings = parentView.get('childViews');
        nextView = siblings.objectAt(siblings.indexOf(this) + 1);
        nextNode = (nextView) ? nextView.get('layer') : null;
        this._gotoAttachingState(parentNode, nextNode);
      } else {
        this._gotoUnattachedChildState();
      }
    } else {
      this._gotoUnattachedOrphanState();
    }
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
  },

  /** @private */
  _gotoUnattachedChildState: function () {
    // Update the state.
    this.set('_state', 'unattached_child');
    this._cascadeStateToChildViews();
  },

  /** @private */
  _gotoUnattachedOrphanState: function () {
    // Update the state.
    this.set('_state', 'unattached_orphan');
  },

  /** @private */
  _gotoUnrenderedChildState: function () {
    // Update the state.
    this.set('_state', 'unrendered_child');
    this._cascadeStateToChildViews();
  },

  /** @private */
  _gotoUnrenderedOrphanState: function () {
    // Update the state.
    this.set('_state', 'unrendered_orphan');
  },

  /** @private */
  _gotoUpdatingState: function () {
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
    this._updateOnShown = false;

    // TODO: Deprecate layerNeedsUpdate and remove this.
    this.set('layerNeedsUpdate', NO);

    // Notify updated.
    this._updated();
  },

  /** @private */
  _gotoShownState: function () {
    // Update the state.
    this.set('_state', 'attached_shown');
    // this._cascadeStateToChildViews();

    // If the display should have changed while in another non-shown state, do the update now.
    if (this._updateOnShown) {
      this._doUpdate();
    }
  },

  // ------------------------------------------------------------------------
  // Methods
  //

  /** @private Send the 'event' (i.e. call the method, which is recursive) on all child views. */
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
    var childView, childViews = this.get('childViews');

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      childView._state = this.get('_state');

      // Recurse through all possible child views.
      childView._cascadeStateToChildViews();
    }
  }

});

SC.CoreView.prototype.displayDidChange = SC.CoreView.prototype._doUpdate;
