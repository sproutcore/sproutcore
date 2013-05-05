// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals ok */

var parent;

/** Test the SC.View states. */
module("SC.View States", {

  setup: function () {
    parent = SC.View.create();
  },

  teardown: function () {
    parent.destroy();
    parent = null;
  }

});

/**
  Test the state, in particular supported actions.
  */
test("Test unrendered state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  equals(view.currentState, SC.CoreView.UNRENDERED, "A newly created view should be in the state");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('_isRendered'), "_isRendered should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doDestroyLayer() doesn't change state");

  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doDetach() doesn't change state");

  handled = view._doHide();
  ok(!handled, "Calling _doHide() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doHide() doesn't change state");

  handled = view._doShow();
  ok(!handled, "Calling _doShow() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doShow() doesn't change state");

  handled = view._doUpdateContent();
  ok(!handled, "Calling _doUpdateContent() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(!handled, "Calling _doUpdateLayout() should not be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doUpdateLayout() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doRender();
  ok(handled, "Calling _doRender() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doRender() changes state");


  // CLEAN UP
  view.destroy();
});

/**
  Test the state, in particular supported actions.
  */
test("Test unattached state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  view._doRender();
  equals(view.currentState, SC.CoreView.UNATTACHED, "A newly created view that is rendered should be in the state");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doDetach() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS

  // Queued.
  handled = view._doShow();
  ok(handled, "Calling _doShow() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doShow() doesn't change state");

  // Queued.
  handled = view._doHide();
  ok(handled, "Calling _doHide() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doHide() doesn't change state");

  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doDestroyLayer();
  ok(handled, "Calling _doDestroyLayer() should be handled");
  equals(view.currentState, SC.CoreView.UNRENDERED, "Calling _doDestroyLayer() changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doUpdateContent();
  ok(handled, "Calling _doUpdateContent() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(handled, "Calling _doUpdateLayout() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doUpdateLayout() doesn't change state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();

  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) with unrendered orphan parent should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) changes state");


  // CLEAN UP
  view.destroy();
});


/**
  Test the state, in particular supported actions.
  */
test("Test attached_shown state.", function () {
  var handled,
    view = SC.View.create();

  // Test expected state of the view.
  view._doRender();
  view._doAttach(document.body);
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created orphan view that is rendered and attached should be in the state");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()


  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doDestroyLayer() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS

  handled = view._doShow();
  ok(handled, "Calling _doShow() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doShow() doesn't change state");

  handled = view._doUpdateContent();
  ok(handled, "Calling _doUpdateContent() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  ok(handled, "Calling _doUpdateLayout() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doUpdateLayout() doesn't change state");

  handled = view._doDetach();
  ok(handled, "Calling _doDetach() should be handled");
  equals(view.currentState, SC.CoreView.UNATTACHED, "Calling _doDetach() changes state");

  // Reset
  view.destroy();
  view = SC.View.create();
  view._doRender();
  view._doAttach(document.body);

  handled = view._doHide();
  ok(handled, "Calling _doHide() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "Calling _doHide() changes state");


  // CLEAN UP
  view.destroy();
});


test("Calling destroy layer, clears the layer from all child views.",  function () {
  var child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  view._doAdopt(parent);
  parent._doRender();

  ok(parent.get('layer'), "The parent should have a reference to the layer.");
  ok(view.get('layer'), "The view should have a reference to the layer.");
  ok(child.get('layer'), "The child should have a reference to the layer.");

  parent._doDestroyLayer();
  equals(parent.get('layer'), null, "The parent should not have a reference to the layer.");
  equals(view.get('layer'), null, "The view should not have a reference to the layer.");
  equals(child.get('layer'), null, "The child should not have a reference to the layer.");

  // CLEAN UP
  view.destroy();
});

/** Test the SC.View state propagation to child views. */
module("SC.View Adoption", {

  setup: function () {
    parent = SC.View.create();
  },

  teardown: function () {
    parent.destroy();
    parent = null;
  }

});


test("Test adding a child brings that child to the same state as the parent.", function () {
  var child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  // Test expected state of the view.
  view._doAdopt(parent);
  equals(parent.currentState, SC.CoreView.UNRENDERED, "A newly created parent should be in the state");
  equals(view.currentState, SC.CoreView.UNRENDERED, "A newly created child view of unrendered parent should be in the state");
  equals(child.currentState, SC.CoreView.UNRENDERED, "A newly created child view of unrendered parent's child view should be in the state");
  ok(!view.get('_isRendered'), "_isRendered should be false");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Render the view.
  view._doRender();
  equals(view.currentState, SC.CoreView.UNATTACHED, "A rendered child view of unrendered parent should be in the state");
  equals(child.currentState, SC.CoreView.UNATTACHED, "A rendered child view of unrendered parent's child view should be in the state");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Attach the view.
  view._doAttach(document.body);
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "An attached child view of unrendered parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "An attached child view of unrendered parent's child view should be in the state");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  parent._doRender();
  view._doAdopt(parent);
  equals(parent.currentState, SC.CoreView.UNATTACHED, "A newly created parent that is rendered should be in the state");
  equals(view.currentState, SC.CoreView.UNATTACHED, "A newly created child view of unattached parent should be in the state");
  equals(child.currentState, SC.CoreView.UNATTACHED, "A newly created child view of unattached parent's child view should be in the state");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Attach the view.
  view._doAttach(document.body);
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "An attached child view of unattached parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "An attached child view of unattached parent's child view should be in the state");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Reset
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });

  parent._doAttach(document.body);
  view._doAdopt(parent);
  equals(parent.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created parent that is attached should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created child view of unattached parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created child view of unattached parent's child view should be in the state");
  ok(view.get('_isRendered'), "_isRendered should be true");
  ok(view.get('isAttached'), "isAttached should be true");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");


  // CLEAN UP
  view.destroy();
});


test("Test showing and hiding parent updates child views.", function () {
  var handled,
    child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });

  // Test expected state of the view.
  parent._doRender();
  parent._doAttach(document.body);
  view._doAdopt(parent);
  equals(parent.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created parent that is attached should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created child view of unattached parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "A newly created child view of unattached parent's child view should be in the state");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");

  // Hide the parent.
  parent._doHide();
  equals(parent.currentState, SC.CoreView.ATTACHED_HIDDEN, "A hidden parent that is attached should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "A child view of attached_hidden parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "A child view of attached_hidden parent's child view should be in the state");
  ok(parent.get('_isHiddenBySelf'), "_isHiddenBySelf of parent should be true");
  ok(!parent.get('_isHiddenByAncestor'), "_isHiddenByAncestor of parent should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false now");
  ok(view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be true now");

  // Show the view.
  handled = view._doShow();
  ok(handled, "Calling _doShow() should be handled (queued).");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "Calling _doShow() doesn't change state");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false still");
  ok(view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be true still");

  // Show the parent/hide the view.
  handled = parent._doShow();
  ok(handled, "Calling _doShow() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doShow() changes state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "Calling _doShow() changes state");
  ok(!parent.get('_isHiddenBySelf'), "_isHiddenBySelf of parent should be false");
  ok(!parent.get('_isHiddenByAncestor'), "_isHiddenByAncestor of parent should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  handled = view._doHide();
  ok(handled, "Calling _doHide() should be handled");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "Calling _doHide() changes state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "Calling _doHide() changes state");
  ok(view.get('_isHiddenBySelf'), "_isHiddenBySelf should be true");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");

  // Reset
  parent._doHide();
  view.destroy();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });
  view._doAdopt(parent);

  // Add child to already hidden parent.
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "A child view of attached_hidden parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "A child view of attached_hidden parent's child view should be in the state");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false on add");
  ok(view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be true on add");

  // Reset
  parent.destroy();
  parent = SC.View.create();
  parent._doRender();
  child = SC.View.create();
  view = SC.View.create({ childViews: [child] });
  view._doAdopt(parent);

  // Attach a parent with children
  equals(view.currentState, SC.CoreView.UNATTACHED, "A child view of unattached parent should be in the state");
  equals(child.currentState, SC.CoreView.UNATTACHED, "A child view of unattached parent's child view should be in the state");
  parent._doAttach(document.body);
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "A child view of attached_shown parent should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "A child view of attached_shown parent's child view should be in the state");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");

  // CLEAN UP
  view.destroy();
});

test("Test hiding with transitionHide", function () {
  var child = SC.View.create(),
    transitionHide = { runOut: function () {} },
    view = SC.View.create({ childViews: [child] });

  // Set up.
  parent._doRender();
  parent._doAttach(document.body);
  view._doAdopt(parent);

  // Hide the parent with transitionHide
  parent.set('transitionHide', transitionHide);
  parent._doHide();
  ok(parent.get('_isHiddenBySelf'), "_isHiddenBySelf of parent should be true");
  ok(!parent.get('_isHiddenByAncestor'), "_isHiddenByAncestor of parent should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(!child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be false");
  ok(!parent.get('isVisibleInWindow'), "isVisibleInWindow of parent should be false");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
  ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");
  parent.didTransitionOut(transitionHide);
  ok(parent.get('_isHiddenBySelf'), "_isHiddenBySelf of parent should be true");
  ok(!parent.get('_isHiddenByAncestor'), "_isHiddenByAncestor of parent should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be true");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be true");
  ok(!parent.get('isVisibleInWindow'), "isVisibleInWindow of parent should be false");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

  // CLEAN UP
  view.destroy();
});

/** isVisible */
var child, view;
module("SC.View isVisible integration with shown and hidden state", {

  setup: function () {
    parent = SC.View.create();
    parent._doRender();
    parent._doAttach(document.body);

    child = SC.View.create(),
    view = SC.View.create({ childViews: [child] });
  },

  teardown: function () {
    view.destroy();
    parent.destroy();
    parent = null;
  }

});

test("Test hiding and showing an attached child view with child views.", function () {
  view._doAdopt(parent);

  // Hide the view using isVisible.
  SC.run(function () {
    view.set('isVisible', false);
  });

  equals(parent.currentState, SC.CoreView.ATTACHED_SHOWN, "The parent view should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "The child view should be in the state");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
  ok(view.get('_isHiddenBySelf'), "_isHiddenBySelf should be true");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be true");

  // Show the view using isVisible.
  SC.run(function () {
    view.set('isVisible', true);
  });

  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "The child view should be in the state");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should now be true");
  ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should now be true");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should now be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should now be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should now be false");
  ok(!child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should now be false");
});


test("Test hiding an attached parent view and then adding child views.", function () {
  // Hide the parent using isVisible and then adopting child views.
  SC.run(function () {
    parent.set('isVisible', false);
    view._doAdopt(parent);
  });

  equals(parent.currentState, SC.CoreView.ATTACHED_HIDDEN, "The parent view should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "The child view should be in the state");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be true");
  ok(child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be true");

  // Show the parent using isVisible.
  SC.run(function () {
    parent.set('isVisible', true);
  });

  equals(parent.currentState, SC.CoreView.ATTACHED_SHOWN, "The parent view should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_SHOWN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_SHOWN, "The child view should be in the state");
  ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
  ok(!view.get('_isHiddenBySelf'), "_isHiddenBySelf should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  ok(!child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be false");
});


test("Test showing an attached parent view while hiding the child view.", function () {
  SC.run(function () {
    parent.set('isVisible', false);
    view._doAdopt(parent);

    // Hide the view and then show the parent using isVisible.
    view.set('isVisible', false);
    parent.set('isVisible', true);
  });

  equals(parent.currentState, SC.CoreView.ATTACHED_SHOWN, "The parent view should be in the state");
  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "The child view should be in the state");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
  ok(view.get('_isHiddenBySelf'), "_isHiddenBySelf should be true");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be true");
});


test("Test adding a hidden child view to attached shown parent.", function () {
  // Hide the view with isVisible and then add to parent.
  SC.run(function () {
    view.set('isVisible', false);
    view._doAdopt(parent);
  });

  equals(view.currentState, SC.CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  equals(child.currentState, SC.CoreView.ATTACHED_HIDDEN, "The child view should be in the state");
  ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
  ok(view.get('_isHiddenBySelf'), "_isHiddenBySelf should be true");
  ok(!view.get('_isHiddenByAncestor'), "_isHiddenByAncestor should be false");
  ok(!child.get('_isHiddenBySelf'), "_isHiddenBySelf of child should be false");
  ok(child.get('_isHiddenByAncestor'), "_isHiddenByAncestor of child should be true");
});

