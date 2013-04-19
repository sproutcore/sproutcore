// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals ok */

module("SC.View States");

/**
  Test the state, in particular supported actions.
  */
test("Test unrendered_orphan state.", function () {
  var handled,
    parent = SC.View.create(),
    view = SC.View.create();

  // Test expected state of the view.
  equals(view._state, 'unrendered_orphan', "A newly created view should be in the state");
  ok(!view.get('isAdopted'), "isAdopted should be false");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isRendered'), "isRendered should be false");
  ok(!view.get('isShown'), "isShown should be false");


  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doDestroyLayer() doesn't change state");

  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doDetach() doesn't change state");

  handled = view._doOrphan();
  ok(!handled, "Calling _doOrphan() should not be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doOrphan() doesn't change state");

  handled = view._doUpdate();
  ok(!handled, "Calling _doUpdate() should not be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doUpdate() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doAdopt(parent);
  ok(handled, "Calling _doAdopt() should be handled");
  equals(view._state, 'unrendered_child', "Calling _doAdopt() changes state");

  // Reset
  view = SC.View.create();

  handled = view._doRender();
  ok(handled, "Calling _doRender() should be handled");
  equals(view._state, 'unattached_orphan', "Calling _doRender() changes state");
});

/**
  Test the state, in particular supported actions.
  */
test("Test unattached_orphan state.", function () {
  var handled,
    parent = SC.View.create(),
    view = SC.View.create();

  // Test expected state of the view.
  view._doRender();
  equals(view._state, 'unattached_orphan', "A newly created view that is rendered should be in the state");
  ok(!view.get('isAdopted'), "isAdopted should be false");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isShown'), "isShown should be false");


  // UNHANDLED ACTIONS
  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unattached_orphan', "Calling _doDetach() doesn't change state");

  handled = view._doOrphan();
  ok(!handled, "Calling _doOrphan() should not be handled");
  equals(view._state, 'unattached_orphan', "Calling _doOrphan() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view._state, 'unattached_orphan', "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) should be handled");
  equals(view._state, 'attached_orphan', "Calling _doAttach(document.body) changes state");

  // Reset
  view = SC.View.create();
  view._doRender();

  handled = view._doDestroyLayer();
  ok(handled, "Calling _doDestroyLayer() should be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doDestroyLayer() changes state");

  // Reset
  view = SC.View.create();
  view._doRender();

  handled = view._doUpdate();
  ok(handled, "Calling _doUpdate() should be handled");
  equals(view._state, 'unattached_orphan', "Calling _doUpdate() doesn't change state");

  // Reset
  view = SC.View.create();
  view._doRender();

  handled = view._doAdopt(parent);
  ok(handled, "Calling _doAdopt() with unrendered_orphan parent should be handled");
  equals(view._state, 'unattached_child', "Calling _doAdopt() changes state");

  // Reset
  view = SC.View.create();
  view._doRender();
  parent = SC.View.create();
  view._doRender();

  handled = view._doAdopt(parent);
  ok(handled, "Calling _doAdopt() with unattached_orphan parent should be handled");
  equals(view._state, 'unattached_child', "Calling _doAdopt() changes state");

});

/**
  Test the state, in particular supported actions.
  */
test("Test unrendered_child state.", function () {
  var handled,
    parent = SC.View.create(),
    view = SC.View.create();

  // Test expected state of the view.
  view._doAdopt(parent);

  equals(view._state, 'unrendered_child', "A newly created view that is adopted should be in the state");
  ok(view.get('isAdopted'), "isAdopted should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(!view.get('isRendered'), "isRendered should be false");
  ok(!view.get('isShown'), "isShown should be false");


  // UNHANDLED ACTIONS
  handled = view._doAdopt(parent);
  ok(!handled, "Calling _doAdopt() with the same parent should not be handled");
  equals(view._state, 'unrendered_child', "Calling _doAdopt() doesn't change state");

  handled = view._doAttach(document.body);
  ok(!handled, "Calling _doAttach(document.body) should not be handled");
  equals(view._state, 'unrendered_child', "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  ok(!handled, "Calling _doDestroyLayer() should not be handled");
  equals(view._state, 'unrendered_child', "Calling _doDestroyLayer() doesn't change state");

  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unrendered_child', "Calling _doDetach() doesn't change state");

  handled = view._doUpdate();
  ok(!handled, "Calling _doUpdate() should not be handled");
  equals(view._state, 'unrendered_child', "Calling _doUpdate() doesn't change state");


  // HANDLED ACTIONS
  handled = view._doOrphan();
  ok(handled, "Calling _doOrphan() should be handled");
  equals(view._state, 'unrendered_orphan', "Calling _doOrphan() changes state");

  // Reset
  view = SC.View.create();
  view._doAdopt(parent);

  handled = view._doRender();
  ok(handled, "Calling _doRender() should be handled");
  equals(view._state, 'unattached_child', "Calling _doRender() changes state");

  // Reset
  view = SC.View.create();
  view._doAdopt(parent);
  var otherParent = SC.View.create();

  handled = view._doAdopt(otherParent);
  ok(handled, "Calling _doAdopt() with other parent should be handled");
  equals(view._state, 'unrendered_child', "Calling _doAdopt() with other parent doesn't change state");
});

/**
  Test the state, in particular supported actions.
  */
test("Test unattached_child state.", function () {
  var handled,
    parent = SC.View.create(),
    view;

  // Test expected state of the view.
  parent._doRender();
  view = SC.View.create();
  view._doAdopt(parent);

  equals(view._state, 'unattached_child', "A newly created view that is adopted to a rendered parent should be in the state");
  ok(view.get('isAdopted'), "isAdopted should be true");
  ok(!view.get('isAttached'), "isAttached should be false");
  ok(view.get('isRendered'), "isRendered should be true");
  ok(!view.get('isShown'), "isShown should be false");


  // UNHANDLED ACTIONS

  handled = view._doAdopt(parent);
  ok(!handled, "Calling _doAdopt() with the same parent should not be handled");
  equals(view._state, 'unattached_child', "Calling _doAdopt() doesn't change state");

  handled = view._doDetach();
  ok(!handled, "Calling _doDetach() should not be handled");
  equals(view._state, 'unattached_child', "Calling _doDetach() doesn't change state");

  handled = view._doRender();
  ok(!handled, "Calling _doRender() should not be handled");
  equals(view._state, 'unattached_child', "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS

  handled = view._doAttach(document.body);
  ok(handled, "Calling _doAttach(document.body) should be handled");
  equals(view._state, 'attached_shown', "Calling _doAttach(document.body) changes state");

  // Reset.
  view = SC.View.create();
  view._doAdopt(parent);

  handled = view._doDestroyLayer();
  ok(handled, "Calling _doDestroyLayer() should be handled");
  equals(view._state, 'unrendered_child', "Calling _doDestroyLayer() changes state");

  // Reset.
  view = SC.View.create();
  view._doAdopt(parent);

  handled = view._doOrphan();
  ok(handled, "Calling _doOrphan() should be handled");
  equals(view._state, 'unattached_orphan', "Calling _doOrphan() changes state");

  // Reset.
  view = SC.View.create();
  view._doAdopt(parent);

  handled = view._doUpdate();
  ok(handled, "Calling _doUpdate() should be handled");
  equals(view._state, 'unattached_child', "Calling _doUpdate() doesn't change state");
});

/**
  handled = view._doAdopt(parent);
  handled = view._doAttach(document.body);
  handled = view._doDestroyLayer();
  handled = view._doDetach();
  handled = view._doHide();
  handled = view._doOrphan();
  handled = view._doRender();
  handled = view._doShow();
  handled = view._doUpdate();
*/
