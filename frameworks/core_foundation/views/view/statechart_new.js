

SC.CoreViewStatechart = SC.Object.extend(SC.StatechartManager, {

  rootState: SC.State.design({

    // adopted: function () {
    //   if (this.stateIsCurrentState('orphan')) {
    //     this.gotoState('child');
    //   }
    // },

    // orphaned: function () {
    //   if (this.stateIsCurrentState('child')) {
    //     this.gotoState('orphan');
    //   }
    // },

    /** @private Cancel a transition. */
    cancelTransition: function () {
      var owner = this.get('owner');

      // Cancel animation and teardown.
      owner.cancelAnimation();
    },

    /** @private Set up a transition. */
    setupTransition: function (transition, options, inPlace) {
      var owner = this.get('owner');

      // Prepare for a transition.
      this._preTransitionLayout = SC.clone(owner.get('layout'));
      this._preTransitionFrame = owner.get('borderFrame');

      // Set up the transition.
      if (transition.setup) {
        transition.setup(this, options, inPlace);
      }
    },

    /** @private Teardown a transition. */
    teardownTransition: function () {
      var owner = this.get('owner');

      // Reset the layout to its original value.
      owner.set('layout', this._preTransitionLayout);

      // Clean up.
      delete this._preTransitionLayout;
      delete this._preTransitionFrame;
    },

    // orphan: SC.State.design({

    executeAdopt: function (parentView, beforeView) {
      var childViews = parentView.get('childViews'),
        owner = this.get('owner'),
        index;

      // Send notifications.
      if (parentView.willAddChild) { parentView.willAddChild(owner, beforeView); }
      if (owner.willAddToParent) { owner.willAddToParent(parentView, beforeView); }

      // Set parentView.
      owner.set('parentView', parentView);

      // Add to the new parent's childViews array.
      if (childViews.needsClone) { parentView.set(childViews = []); }
      index = (beforeView) ? childViews.indexOf(beforeView) : childViews.length;
      if (index < 0) { index = childViews.length; }
      childViews.insertAt(index, owner);
    },

    //// Substates /////////////////////////////////////////////////////////////

    initialSubstate: 'unrendered',

    unrendered: SC.State.design({

      doAdopt: function (parentView, beforeView) {
        // Perform the adoption.
        this.invokeStateMethod('executeAdopt', parentView, beforeView);

        // Route.
        if (parentView._viewState.stateIsCurrentState('unrendered')) {
          // Do nothing.
        } else {
          // Render to match the parent.
          this.executeRender();
          this.gotoState('rendered');

          // Attach to the parent.
          var parentNode = parentView.get('containerLayer'),
            siblings = parentView.get('childViews'),
            nextView = siblings.objectAt(siblings.indexOf(this) + 1),
            nextNode = (nextView) ? nextView.get('layer') : null;

          this.invokeStateMethod('executeAttach', parentNode, nextNode);

          // Continue routing.
          if (parentView._viewState.stateIsCurrentState('unattached') || parentView._viewState.stateIsCurrentState('unattachedByParent')) {
            this.gotoState('unattachedByParent');
          } else {
            var owner = this.get('owner');

            if (owner.get('isVisible')) {
              if (parentView.get('isVisible')) {
                if (owner.get('transitionIn')) {
                  this.gotoState('buildingIn');
                } else {
                  this.gotoState('visible');
                }
              } else {
                this.gotoState('hiddenByParent');
              }
            } else {
              this.gotoState('hidden');
            }
          }
        }
      },

      doRender: function () {
        // Execute the rendering.
        this.executeRender();

        this.gotoState('rendered');
      },

      /** @private Render the layer. */
      executeRender: function () {
        var owner = this.get('owner'),
          context = owner.renderContext(owner.get('tagName'));

        owner.renderToContext(context);
        owner.set('layer', context.element());
      }

    }),

    rendered: SC.State.design({

      doDestroyLayer: function () {
        var owner = this.get('owner'),
          idx, len, mixins;

        // Notify.
        if (owner.willDestroyLayer) { owner.willDestroyLayer(); }
        mixins = owner.willDestroyLayerMixin;
        if (mixins) {
          len = mixins.length;
          for (idx = 0; idx < len; ++idx) {
            mixins[idx].call(this);
          }
        }

        this.executeDestroyLayer();
      },

      executeDestroyLayer: function () {
        // Remove the layer reference.
        this.set('layer', null);
      },

      enterState: function () {
        var displayProperties,
          len, idx,
          mixins = this.didCreateLayerMixin;

        // Register display property observers.
        displayProperties = this.get('displayProperties');
        for (idx = 0, len = displayProperties.length; idx < len; idx++) {
          this.addObserver(displayProperties[idx], this, this.displayDidChange);
        }

        // Notify.
        if (this.didCreateLayer) { this.didCreateLayer(); }
        if (mixins) {
          len = mixins.length;
          for (idx = 0; idx < len; ++idx) {
            mixins[idx].call(this);
          }
        }

        // Begin observing isVisible & isFirstResponder.
        this.addObserver('isVisible', this, this._isVisibleDidChange);
        this.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);
      },

      exitState: function () {
        var displayProperties,
          idx, len;

        // Stop observing isVisible & isFirstResponder.
        this.removeObserver('isVisible', this, this._isVisibleDidChange);
        this.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);

        // Unregister display property observers.
        displayProperties = this.get('displayProperties');
        for (idx = 0, len = displayProperties.length; idx < len; idx++) {
          this.removeObserver(displayProperties[idx], this, this.displayDidChange);
        }
      },

      initialSubstate: 'unattached',

      unattached: SC.State.design({

        doAdopt: function (parentView, beforeView) {
          // Perform the adoption.
          this.invokeStateMethod('executeAdopt', parentView, beforeView);

          // Route.
          if (parentView._viewState.stateIsCurrentState('unrendered')) {
            // If the parent is unrendered, it doesn't make sense for the child to have a layer.
            this.invokeStateMethod('executeDestroyLayer');
            this.gotoState('unrendered');
          } else {
            // Attach to the parent.
            var parentNode = parentView.get('containerLayer'),
              siblings = parentView.get('childViews'),
              nextView = siblings.objectAt(siblings.indexOf(this) + 1),
              nextNode = (nextView) ? nextView.get('layer') : null;

            this.invokeStateMethod('executeAttach', parentNode, nextNode);

            // Continue routing.
            if (parentView._viewState.stateIsCurrentState('unattached') || parentView._viewState.stateIsCurrentState('unattachedByParent')) {
              this.gotoState('unattachedByParent');
            } else {
              var owner = this.get('owner');

              if (owner.get('isVisible')) {
                if (parentView.get('isVisible')) {
                  if (owner.get('transitionIn')) {
                    this.gotoState('buildingIn');
                  } else {
                    this.gotoState('visible');
                  }
                } else {
                  this.gotoState('hiddenByParent');
                }
              } else {
                this.gotoState('hidden');
              }
            }
          }
        },

        /** @private Attach the layer. */
        executeAttach: function (parentNode, nextNode) {
          var owner = this.get('owner'),
            node = owner.get('layer');

          // NOTE: IE doesn't support insertBefore(blah, undefined) in version IE9.
          parentNode.insertBefore(node, nextNode || null);
        }

      }),

      attached: SC.State.design({

        doAdopt: function (parentView, beforeView) {
          // Perform the adoption.
          this.invokeStateMethod('executeAdopt', parentView, beforeView);

          // Route.
          if (parentView._viewState.stateIsCurrentState('unrendered')) {
            // If the parent is unrendered, it doesn't make sense for the child to be attached and to have a layer.
            this.invokeStateMethod('executeDetach');
            this.gotoState('unattached');
            this.invokeStateMethod('executeDestroyLayer');
            this.gotoState('unrendered');
          } else {
            // Attach to the parent.
            var parentNode = parentView.get('containerLayer'),
              siblings = parentView.get('childViews'),
              nextView = siblings.objectAt(siblings.indexOf(this) + 1),
              nextNode = (nextView) ? nextView.get('layer') : null;

            this.invokeStateMethod('executeAttach', parentNode, nextNode);

            // Continue routing.
            if (parentView._viewState.stateIsCurrentState('unattached') || parentView._viewState.stateIsCurrentState('unattachedByParent')) {
              this.gotoState('unattachedByParent');
            } else {
              var owner = this.get('owner');

              if (owner.get('isVisible')) {
                if (parentView.get('isVisible')) {
                  if (owner.get('transitionIn')) {
                    this.gotoState('buildingIn');
                  } else {
                    this.gotoState('visible');
                  }
                } else {
                  this.gotoState('hiddenByParent');
                }
              } else {
                this.gotoState('hidden');
              }
            }
          }
        },

        doDetach: function () {

        },

        /** @private Detach the layer. */
        executeDetach: function () {
          // Give child views a chance to exit any transitionary states.
          this._sendStateEventToChildViews('viewState', 'parentWillDetach');

          // Detach the layer.
          var node = this.get('layer');
          node.parentNode.removeChild(node);

          // Ensure child views update their view state.
          this._sendStateEventToChildViews('viewState', 'parentDetached');
        },

        enterState: function () {

        },

        exitState: function () {

        },

        initialSubstate: 'visible',

        hidden: SC.State.design({

        }),

        hiding: SC.State.design({

          doAdopt: function (parentView, beforeView) {
            // This is a weird scenario.  But if doAdopt is called while transitioning, we should just end the transition immediately or else risk the animation callback failing when we move the node.
            this.invokeStateMethod('cancelTransition');

            this.gotoState('attached.hidden');

            // Let the parent substate handle this.
            return false;
          },

          enterState: function () {
            var owner = this.get('owner');

            this.invokeStateMethod('setupTransition', owner.get('transitionHide'), owner.get('transitionHideOptions'), false);
          },

          exitState: function () {
            this.invokeStateMethod('teardownTransition');
          }

        }),

        visible: SC.State.design({
          initialSubstate: 'shown',

          shown: SC.State.design({

          })

        })

      })
    })

  })
});
