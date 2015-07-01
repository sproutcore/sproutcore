// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  Implements basic target + action support for views. To use, simply set the `action` property on
  the view to the name of a method handled by an object in the current responder chain and call
  `fireAction`. If the `target` property is also set, the `action` will only be attempted on that
  target object. If not set, then the responder chain will be searched for an object that implements
  the named action.

  *Note* Because searching the responder chain is slower, it is recommended to specify an actual
  target whenever possible.

  ### Implementing Actions in a Target

  The method signature for target + action implementors is,

      methodName: function (sender, context) {
        return; // Optional: return a value to the sender.
      }

  For views implementing `SC.ActionSupport`, the `sender` will always be `this`, which can be useful
  when an action may be called by multiple views and the target needs to know from which view it was
  triggered. For example, here is an action that will hide the sender's (any sender's) pane,

      // Hides the pane of the current sender.
      hidePane: function (sender) {
        var pane = sender.get('pane');
        pane.set('isVisible', false);
      }

  In order to pass additional information to the target, the target's action method may accept a
  second argument, `context`. This argument will be the value of the same-named `context` argument
  passed to `fireAction()` of the view. Here is a simple example to help illustrate this,

      // Target
      var theTargetObject = SC.Object.create({

        theActionMethod: function (sender, context) {
          console.log("theActionMethod was called at: %@".fmt(context.calledAt))
        }

      });

      // View with SC.ActionSupport
      var view = SC.View.create(SC.ActionSupport, {
        action: 'theActionMethod',
        target: theTargetObject,

        someEvent: function () {
          var addedContext = {
            calledAt: new Date() // Calling specific information to pass to the target.
          };

          this.fireAction(addedContext);
        }

      });

  @since SproutCore 1.7
*/
SC.ActionSupport =
/** @scope SC.ActionSupport.prototype */ {

  //@if(debug)
  // Provide some debug-only developer warning support.
  initMixin: function () {
    if (this.actionContext !== null) {
      SC.warn("Developer Warning: The `actionContext` property of `SC.ActionSupport` has been deprecated. Please pass the `context` argument to `fireAction()` directly.");
    }
  },
  //@endif

  /**
    The name of the method to call when `fireAction` is called.

    This property is used in conjunction with the `target` property to execute a method when
    `fireAction` is called. If you do not specify a target, then the responder chain will be
    searched for a view that implements the named action. If you do set a target, then the button
    will only try to call the method on that target.

    The action method of the target should implement the following signature:

        methodName: function (sender, context) {
          return; // Optional: return a value to the sender.
        }

    ### Supporting multiple actions

    The most correct way to handle variable properties in SproutCore is to use a computed property.
    For example, imagine if the action depended on a property, `isReady`. While we could set
    `action` accordingly each time prior to calling `fireAction()` like so,

        mouseUp: function () {
          var isReady = this.get('isReady');

          if (isReady) {
            this.set('action', 'doReadyAction');
          } else {
            this.set('action', 'doNotReadyAction');
          }

          this.fireAction();
        }

    This is a bit wasteful (imagine `isReady` doesn't change very often) and leaves `action` in
    an improper state (i.e. what if `isReady` changes without a call to mouseUp, then `action` is
    incorrect for any code that may reference it).

    The better approach is to make `action` a computed property dependent on `isReady`.

    For example, the previous example would be better as,

        action: function () {
          return this.get('isReady') ? 'doReadyAction' : 'doNotReadyAction';
        }.property('isReady'), // .cacheable() - optional to cache the result (consider memory used to cache result vs. computation time to compute result)

        mouseUp: function () {
          this.fireAction(); // Fires with current value of `action`.
        }

    @type String
    @default null
  */
  action: null,

  /** @deprecated Version 1.11.0. Please specify `context` argument when calling fireAction method.
    @type Object
    @default null
  */
  actionContext: null,

  /**
    The target to invoke the action on when `fireAction` is called.

    If you set this target, the action will be called on the target object directly when the button
    is clicked.  If you leave this property set to `null`, then the responder chain will be
    searched for a view that implements the action when the button is pressed.

    The action method of the target should implement the following signature:

        methodName: function (sender, context) {
          return; // Optional: return a value to the sender.
        }

    ### Supporting multiple targets

    The most correct way to handle variable properties in SproutCore is to use a computed property.
    For example, imagine if the target depended on a property, `isReady`. While we could set
    `target` accordingly each time prior to calling `fireAction()` like so,

        mouseUp: function () {
          var isReady = this.get('isReady');

          if (isReady) {
            this.set('target', MyApp.readyTarget);
          } else {
            this.set('target', MyApp.notReadyTarget);
          }

          this.fireAction();
        }

    This is a bit wasteful (imagine `isReady` doesn't change very often) and leaves `target` in
    an improper state (i.e. what if `isReady` changes without a call to mouseUp, then `target` is
    incorrect for any code that may reference it).

    The better approach is to make `target` a computed property dependent on `isReady`.

    For example, the previous example would be better as,

        target: function () {
          return this.get('isReady') ? MyApp.readyTarget : MyApp.notReadyTarget;
        }.property('isReady'), // .cacheable() - optional to cache the result (consider memory used to cache result vs. computation time to compute result)

        mouseUp: function () {
          this.fireAction(); // Fires with current value of `target`.
        }

    @type Object
    @default null
  */
  target: null,

   /**
     Perform the current action on the current target with the given context. If no target is set,
     then the responder chain will be searched for an object that implements the action.

     You can pass the `context` parameter, which is useful in order to provide additional
     information to the target, such as the current state of the sender when the action was
     triggered.

     @param {Object} [context] additional context information to pass to the target
     @returns {Boolean} true if successful; false otherwise
  */
  // TODO: remove backwards compatibility for `action` argument
  fireAction: function (actionOrContext) {
    var pane = this.get('pane'),
      rootResponder = pane.get('rootResponder'),
      action = this.get('action'),
      context;

    // Normalize arguments.
    // TODO: Fully deprecate action argument and actionContext property.

    // No argument, use action (above) and actionContext properties.
    if (actionOrContext === undefined) {
      context = this.get('actionContext');

    // String argument and no action (above) property, assume action method name. Use argument with actionContext property.
    } else if (typeof actionOrContext === SC.T_STRING && action == null) {
      //@if(debug)
      // Provide some debug-only developer warning support.
      SC.warn("Developer Warning: The signature of `SC.ActionSupport.prototype.fireAction` has changed. Please set the `action` property on your view and only pass an optional context argument to `fireAction`.");
      //@endif
      action = actionOrContext;
      context = this.get('actionContext');

    // Something else, use action property (above) and context argument.
    } else {
      context = actionOrContext;
    }

    if (action && rootResponder) {
      return rootResponder.sendAction(action, this.get('target'), this, pane, context, this);
    }

    return false;
  }

};
