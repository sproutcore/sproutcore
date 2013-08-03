sc_require("views/view/base");
sc_require('system/statechart');


SC.CoreViewChild = SC.State.extend({

});


SC.CoreViewOrphan = SC.State.extend({

  doAdopt: function (parentView, beforeView) {
    // Perform the adoption.
    this.executeAdopt(parentView, beforeView);

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

  doAdopt: function (parentView, beforeView) {
    // Perform the adoption.
    this.executeAdopt(parentView, beforeView);

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

  doAdopt: function (parentView, beforeView) {
    // Perform the adoption.
    this.executeAdopt(parentView, beforeView);

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

  /** @private Connects the view to its parent before the given beforeView. */
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
  }

});


SC.CoreViewStatechart = SC.Object.extend(SC.StatechartManager, {

  rootState: SC.State.design({

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

    //// Substates /////////////////////////////////////////////////////////////

    initialSubstate: 'unrendered',

    unrendered: SC.State.design({

      doRender: function () {
        // Perform the rendering.
        this.executeRender();

        // Route.
        this.gotoState('rendered');
      },

      /** @private Render the layer. */
      executeRender: function () {
        var owner = this.get('owner'),
          context = owner.renderContext(owner.get('tagName'));

        owner.renderToContext(context);
        owner.set('layer', context.element());
      },

      //// Substates ///////////////////////////////////////////////////////////

      initialSubstate: 'orphan',

      orphan: SC.CoreViewOrphan,

      child: SC.CoreViewChild

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

        // Route.
        this.gotoState('unrendered');
      },

      /** @private Destroy the layer. */
      executeDestroyLayer: function () {
        var owner = this.get('owner');

        // Remove the layer reference.
        owner.set('layer', null);
      },

      /** @private */
      enterState: function () {
        var displayProperties,
          len, idx,
          owner = this.get('owner'),
          mixins = owner.didCreateLayerMixin;

        // Begin observing isVisible, isFirstResponder and displayProperties
        owner.addObserver('isVisible', this, this._isVisibleDidChange);
        owner.addObserver('isFirstResponder', this, this._isFirstResponderDidChange);
        displayProperties = owner.get('displayProperties');
        for (idx = 0, len = displayProperties.length; idx < len; idx++) {
          owner.addObserver(displayProperties[idx], this, owner.displayDidChange);
        }

        // Notify.
        if (owner.didCreateLayer) { owner.didCreateLayer(); }
        if (mixins) {
          len = mixins.length;
          for (idx = 0; idx < len; ++idx) {
            mixins[idx].call(owner);
          }
        }
      },

      /** @private */
      exitState: function () {
        var owner = this.get('owner'),
          displayProperties,
          idx, len;

        // Stop observing isVisible, isFirstResponder and displayProperties
        owner.removeObserver('isVisible', this, this._isVisibleDidChange);
        owner.removeObserver('isFirstResponder', this, this._isFirstResponderDidChange);
        displayProperties = this.get('displayProperties');
        for (idx = 0, len = displayProperties.length; idx < len; idx++) {
          owner.removeObserver(displayProperties[idx], this, owner.displayDidChange);
        }

        // Perform the destruction.
        this.executeDestroyLayer();
      },

      //// Substates ///////////////////////////////////////////////////////////

      initialSubstate: 'unattached',

      unattached: SC.State.design({

        doAttach: function (parentNode, nextNode) {
          var owner = this.get('owner');

          // Perform the attachment.
          this.executeAttach(parentNode, nextNode);

          // Route.
          if (owner.get('isVisible')) {
            if (owner.get('transitionIn')) {
              this.gotoState('buildingIn');
            } else {
              this.gotoState('shown');
            }
          } else {
            this.gotoState('hidden');
          }

          // Notify.
          if (owner.didAppendToDocument) { owner.didAppendToDocument(); }
          owner._sendStateEventToChildViews('viewState', 'ancestorDidAttach');
        },

        /** @private Attach the layer. */
        executeAttach: function (parentNode, nextNode) {
          var owner = this.get('owner'),
            node = owner.get('layer');

          // NOTE: IE doesn't support insertBefore(blah, undefined) in version IE9.
          parentNode.insertBefore(node, nextNode || null);
        },

        //// Substates /////////////////////////////////////////////////////////

        initialSubstate: 'orphan',

        orphan: SC.CoreViewOrphan,

        child: SC.CoreViewChild.design({

          doAttach: function (parentNode, nextNode) {
            var owner = this.get('owner'),
              parent = owner.get('parentView'),
              parentViewState = parent.get('viewState');

            // Route according to child and parent.
            if (parentViewState.stateIsCurrentState('rendered')) {
              if (parentViewState.stateIsCurrentState('hidden') || // 8. hidden
                parentViewState.stateIsCurrentState('hiddenByAncestor') || // 10. hidden by ancestor
                parentViewState.stateIsCurrentState('unattached')) { // 2. unattached

                // Perform the attachment.
                this.invokeStateMethod('executeAttach', parentNode, nextNode);

                if (owner.get('isVisible')) {
                  this.gotoState('hiddenByAncestor');
                } else {
                  this.gotoState('hidden');
                }

                // Notify.
                if (owner.didAppendToDocument) { owner.didAppendToDocument(); }
                owner._sendStateEventToChildViews('viewState', 'ancestorDidAttach');

              } else { // 7. shown, 5. showing, 3. building in, 6. hiding, 4. building out, 9. building out by ancestor
                // Note: 4. building out && 9. building out by ancestor
                // An ancestor is building out just as we are attaching.  We could either try to join in if
                // we have a transitionOut or proceed as normal.  Trying to join in is a bad idea, due to
                // the way build outs are synchronized down the child view tree, so let's just go with
                // the normal method.
                return NO;  // Bubble.
              }
            } else { // 1. unrendered
              //@if(debug)
              throw new Error("Developer Error: You can not attach the child view, %@, because its parent view is not attached.".fmt(this));
              //@endif
            }
          }
        })

      }),

      attached: SC.State.design({

        doDetach: function () {
          var owner = this.get('owner');

          // Notify.
          if (owner.willRemoveFromDocument) { owner.willRemoveFromDocument(); }
          owner._sendStateEventToChildViews('viewState', 'ancestorWillDetach');

          // Perform the detachment.
          this.executeDetach();

          // Route.
          this.gotoState('unattached');

          // Ensure child views update their view state.
          owner._sendStateEventToChildViews('viewState', 'ancestorDidDetach');
        },

        /** @private Detach the layer. */
        executeDetach: function () {
          // Detach the layer.
          var owner = this.get('owner'),
            node = owner.get('layer');

          node.parentNode.removeChild(node);
        },

        /** @private */
        enterState: function () {
          var owner = this.get('owner');

          // Notify.
          if (owner.didAppendToDocument) { owner.didAppendToDocument(); }
          owner._sendStateEventToChildViews('viewState', 'ancestorDidAttach');
        },

        //// Substates /////////////////////////////////////////////////////////

        initialSubstate: 'visible',

        hidden: SC.State.design({

          doShow: function () {
            var owner = this.get('owner');

            // Notify.
            if (this.willShowInDocument) { this.willShowInDocument(); }
            // owner._sendStateEventToChildViews('viewState', 'ancestorWillShow');

            // Perform show.
            this.executeShow();

            // Route.
            if (owner.get('transitionShow')) {
              this.gotoState('showing');
            } else {
              this.gotoState('shown');
            }

            // Notify.
            if (this.didShowInDocument) { this.didShowInDocument(); }
            owner._sendStateEventToChildViews('viewState', 'ancestorDidShow');
          },

          /** @private Perform the show. */
          executeShow: function () {
            var owner = this.get('owner');

            owner.$().toggleClass('sc-hidden', false);
            owner.$().attr('aria-hidden', null);
          },

          //// Substates ///////////////////////////////////////////////////////

          initialSubstate: 'orphan',

          orphan: SC.CoreViewOrphan,

          child: SC.CoreViewChild.design({

            doShow: function () {
              var owner = this.get('owner'),
                parent = owner.get('parentView'),
                parentViewState = parent.get('viewState');

              // Route according to child and parent.
              if (parentViewState.stateIsCurrentState('attached')) {
                if (parentViewState.stateIsCurrentState('hidden') || // 8. hidden
                  parentViewState.stateIsCurrentState('hiddenByAncestor')) { // 10. hidden by ancestor

                  // Notify.
                  if (this.willShowInDocument) { this.willShowInDocument(); }

                  // Perform the show.
                  this.invokeStateMethod('executeShow');

                  // Route.
                  this.gotoState('hiddenByAncestor');

                  // Notify.
                  if (this.didShowInDocument) { this.didShowInDocument(); }
                  owner._sendStateEventToChildViews('viewState', 'ancestorDidShow');
                } else { // 7. shown, 5. showing, 3. building in, 6. hiding, 4. building out, 9. building out by ancestor
                  // Note: 4. building out && 9. building out by ancestor
                  // An ancestor is building out just as we are showing.  We could either try to join in if
                  // we have a transitionOut or proceed as normal.  Trying to join in is a bad idea, due to
                  // the way build outs are synchronized down the child view tree, so let's just go with
                  // the normal method.
                  return NO;  // Bubble.
                }
              } else { // 1. unrendered, 2. unattached
                //@if(debug)
                throw new Error("Developer Error: You can not show the child view, %@, because its parent view is not attached.".fmt(this));
                //@endif
              }
            }
          })
        }),

        visible: SC.State.design({

          doHide: function () {
            var owner = this.get('owner');

            // Notify.
            if (owner.willHideInDocument) { owner.willHideInDocument(); }
            owner._sendStateEventToChildViews('viewState', 'ancestorWillHide');

            // Perform hide.
            this.executeHide();

            // Route.
            this.gotoState('hidden');

            // Notify.
            if (owner.didHideInDocument) { owner.didHideInDocument(); }
            owner._sendStateEventToChildViews('viewState', 'ancestorDidHide');
          },

          /** @private Perform the hide. */
          executeHide: function () {
            var owner = this.get('owner');

            owner.$().toggleClass('sc-hidden', true);
            owner.$().attr('aria-hidden', true);
          },

          //// Substates ///////////////////////////////////////////////////////

          initialSubstate: 'shown',

          buildingIn: SC.State.design({

            /** */
            doDestroyLayer: function () {
              this.get('owner').cancelAnimation();

              return false; // Bubble.
            },

            /** */
            doDetach: function () {
              this.get('owner').cancelAnimation(SC.LayoutState.CURRENT);

              this.gotoState('shown');

              return false; // Bubble.
            },

            /** */
            doHide: function () {
              this.get('owner').cancelAnimation();

              return false; // Bubble.
            },

            /** */
            transitionDidEnd: function () {
              var owner = this.get('owner');

              // Notify.
              if (owner.didShowInDocument) { owner.didShowInDocument(); }
              owner._sendStateEventToChildViews('viewState', 'ancestorDidShow');

              // Route.
              this.gotoState('shown');
            },

            /** @private */
            enterState: function () {
              var owner = this.get('owner');

              this.invokeStateMethod('setupTransition', owner.get('transitionIn'), owner.get('transitionInOptions'), false);
            },

            /** @private */
            exitState: function () {
              this.invokeStateMethod('teardownTransition');
            },

            //// Substates /////////////////////////////////////////////////////

            initialSubstate: 'orphan',

            orphan: SC.CoreViewOrphan.design({

              /** */
              doAdopt: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');

                sc_super();
              }

            }),

            child: SC.CoreViewChild.design({

              doOrphan: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillBuildOut: function (ancestorStatechart) {
                var owner = this.get('owner');

                if (owner.get('transitionOut')) {
                  ancestorStatechart._buildingOutCount++;

                  owner.cancelAnimation(SC.LayoutState.CURRENT);

                  // Route.
                  this.gotoState('buildingOutByAncestor');
                } else {
                  this.get('owner').cancelAnimation();

                  // Route.
                  this.gotoState('shown');
                }
              },

              /** */
              ancestorWillDestroyLayer: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillDetach: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillHide: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              }

            })

          }),

          buildingOut: SC.State.design({

            /** */
            doAttach: function () {
              var owner = this.get('owner');

              // Route.
              if (owner.get('transitionIn')) {
                owner.cancelAnimation(SC.LayoutState.CURRENT);

                this.gotoState('buildingIn');
              } else {
                owner.cancelAnimation();

                this.gotoState('shown');
              }
            },

            /** */
            doDestroyLayer: function () {
              this.get('owner').cancelAnimation();

              return false; // Bubble.
            },

            /** */
            doDetach: function () {
              return true; // Block.
            },

            /** */
            doHide: function () {
              this.get('owner').cancelAnimation();

              return false; // Bubble.
            },

            /** */
            transitionDidEnd: function () {
              var owner = this.get('owner');

              // Notify.
              if (owner.willRemoveFromDocument) { owner.willRemoveFromDocument(); }
              owner._sendStateEventToChildViews('viewState', 'ancestorWillDetach');

              // Perform the detachment.
              this.invokeStateMethod('executeDetach');

              // Route.
              this.gotoState('unattached');

              // Ensure child views update their view state.
              owner._sendStateEventToChildViews('viewState', 'ancestorDidDetach');
            },

            /** @private */
            enterState: function () {
              var owner = this.get('owner');

              this.invokeStateMethod('setupTransition', owner.get('transitionOut'), owner.get('transitionOutOptions'), false);
            },

            /** @private */
            exitState: function () {
              this.invokeStateMethod('teardownTransition');
            },

            //// Substates /////////////////////////////////////////////////////

            initialSubstate: 'orphan',

            orphan: SC.CoreViewOrphan.design({

              /** */
              doAdopt: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');

                sc_super();
              }

            }),

            child: SC.CoreViewChild.design({

              doOrphan: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillBuildOut: function (ancestorStatechart) {
                var owner = this.get('owner');

                if (owner.get('transitionOut')) {
                  ancestorStatechart._buildingOutCount++;

                  owner.cancelAnimation(SC.LayoutState.CURRENT);

                  // Route.
                  this.gotoState('buildingOutByAncestor');
                } else {
                  this.get('owner').cancelAnimation();

                  // Route.
                  this.gotoState('shown');
                }
              },

              /** */
              ancestorWillDestroyLayer: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillDetach: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              },

              /** */
              ancestorWillHide: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('shown');
              }

            })

          }),

          hiding: SC.State.design({

            doDestroyLayer: function () {
              this.get('owner').cancelAnimation();

              // Route.
              this.gotoState('hidden');

              return false; // Bubble.
            },

            doDetach: function () {
              this.get('owner').cancelAnimation();

              // Route.
              this.gotoState('hidden');

              return false; // Bubble.
            },

            doHide: function () {
              return true; // Block.
            },

            doShow: function () {
              var owner = this.get('owner');

              // Route.
              if (owner.get('transitionShow')) {
                owner.cancelAnimation(SC.LayoutState.CURRENT);

                this.gotoState('showing');
              } else {
                owner.cancelAnimation();

                this.gotoState('shown');
              }
            },

            /** @private */
            enterState: function () {
              var owner = this.get('owner');

              this.invokeStateMethod('setupTransition', owner.get('transitionHide'), owner.get('transitionHideOptions'), false);
            },

            /** @private */
            exitState: function () {
              this.invokeStateMethod('teardownTransition');
            },

            //// Substates /////////////////////////////////////////////////////

            initialSubstate: 'orphan',

            orphan: SC.CoreViewOrphan.design({

              /** */
              doAdopt: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('hidden');

                sc_super();
              }

            }),

            child: SC.CoreViewChild.design({

              /** */
              ancestorWillDestroyLayer: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('hidden');
              },

              /** */
              ancestorWillDetach: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('hidden');
              },

              /** */
              ancestorWillHide: function () {
                this.get('owner').cancelAnimation();

                // Route.
                this.gotoState('hidden');
              }

            })

          }),


          shown: SC.State.design({

            doDetach: function () {
              var owner = this.get('owner');

              // In order to allow the removal of a parent to be delayed by child
              // transitions, we track which views are building out and finish
              // only when they're all done.
              this._buildingOutCount = 0;

              // Tell all the child views so that any with a transitionOut may run it.
              owner._sendStateEventToChildViews('viewState', 'ancestorWillBuildOut', this);

              // Route.
              if (owner.get('transitionOut') || this._buildingOutCount > 0) {
                this.gotoState('buildingOut');
              } else {
                return NO;  // Bubble.
              }
            },

            doHide: function () {
              var owner = this.get('owner');

              // Route.
              if (owner.get('transitionHide')) {
                this.gotoState('hiding');
              } else {
                return NO;  // Bubble.
              }
            },

            //// Substates /////////////////////////////////////////////////////

            initialSubstate: 'orphan',

            orphan: SC.CoreViewOrphan,

            child: SC.CoreViewChild.design({

              ancestorDidDetach: function () {
                this.gotoState('hiddenByAncestor');
              },

              ancestorDidHide: function () {
                this.gotoState('hiddenByAncestor');
              },

              ancestorWillBuildOut: function (ancestorStatechart) {
                var owner = this.get('owner');

                if (owner.get('transitionOut')) {
                  ancestorStatechart._buildingOutCount++;

                  // Route.
                  this.gotoState('buildingOutByAncestor');
                }
              }

            })

          })
        })

      }),

      buildingOut: SC.State.design({})

    })

  })
});
