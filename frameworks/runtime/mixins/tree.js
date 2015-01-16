// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @private */
SC.Tree = /** @scope SC.Tree.prototype */ {

  /** @private Call the method recursively on all child views. */
  invoke: function (methodName, isTopDown, context) {
    var childView,
      childViews = this.get('childViews'),
      method,
      shouldContinue;

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      // Look up the method on the child.
      method = childView[methodName];

      // Call the method on this view *before* its children.
      if (isTopDown === undefined || isTopDown) {
        shouldContinue = method.call(childView, context);
      }

      // Recurse.
      if (shouldContinue === undefined || shouldContinue) {
        childView._callOnChildViews(methodName, isTopDown, context);
      }

      // Call the method on this view *after* its children.
      if (isTopDown === false) {
        method.call(childView, context);
      }
    }
  }

};
