// ========================================================================
// SC.Renderer Base Tests
// ========================================================================
/*globals module test ok isObj equals expects same plan */

var Renderer, ChildRenderer, childRenderer; // global variables

module("SC.Renderer", {
  
  setup: function() {
    Renderer = SC.Renderer.extend({
      prop: null,
      func: function() {
        this.prop = "super";
      }
    });
    ChildRenderer = Renderer.extend({
      func: function() {
        sc_super();
      }
    });
    childRenderer = ChildRenderer.create();
  },
  
  teardown: function() {
    Renderer = ChildRenderer = childRenderer = null;
  }
  
});

test("inheritance", function() {
  equals(ChildRenderer.superclass, Renderer, "the child renderer's superclass should be the Renderer");
});

test("sc_super support", function() {
  var child = childRenderer();
  child.func();
  equals(child.prop, "super", "property should have been set by superclass function");
});
