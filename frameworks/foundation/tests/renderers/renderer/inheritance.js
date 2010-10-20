// ========================================================================
// SC.Renderer Base Tests
// ========================================================================
/*globals module test ok isObj equals expects same plan */

var Renderer, ChildRenderer, childRenderer; // global variables

module("SC.Renderer", {
  
  setup: function() {
    Renderer = SC.Renderer.extend({
      classNames: "base to_be_removed",
      prop: null,
      func: function() {
        this.prop = "super";
      }
    });
    ChildRenderer = Renderer.extend({
      classNames: { "derived": YES, "to_be_removed": NO },
      func: function() {
        sc_super();
      }
    });
    childRenderer = ChildRenderer;
  },
  
  teardown: function() {
    Renderer = ChildRenderer = childRenderer = null;
  }
  
});

test("inheritance", function() {
  equals(ChildRenderer.superclass, Renderer, "the child renderer's superclass should be the Renderer");
});

test("sc_super support", function() {
  var child = childRenderer.create();
  child.func();
  equals(child.prop, "super", "property should have been set by superclass function");
});

test("inheritance of class names", function() {
  var child = childRenderer.create();
  same(child.classNames, SC.Set.create(["base", "derived"]), "class='base derived'");
});

