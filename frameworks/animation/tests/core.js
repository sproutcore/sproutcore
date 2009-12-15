// ==========================================================================
// Project:   SproutCore Animation
// ==========================================================================

/*globals module test ok isObj equals expects */
var view, base, inherited;
module("Animatable", {
  setup: function() {
    view = SC.View.create(SC.Animatable, { 
      layout: { left: 100, top: 100, height: 100, width: 100 },
      transitions: {
        left: 0.25,
        top: { duration: 0.35 },
        width: { duration: 0.2, timing: SC.Animatable.TRANSITION_EASE_IN_OUT }
      }
    });
    
    // identical to normal view above
    base = SC.View.extend(SC.Animatable, { 
      layout: { left: 100, top: 100, height: 100, width: 100 },
      transitions: {
        left: 0.25,
        top: { duration: 0.35 },
        width: { duration: 0.2, timing: SC.Animatable.TRANSITION_EASE_IN_OUT }
      }
    });
    
    // concatenate this
    inherited = base.create({
      transitions: {
        left: 0.99
      }
    });
  }
});

test("animatable should have init-ed correctly", function(){
  var left = view.transitions["left"];
  var top = view.transitions["top"];
  var width = view.transitions["width"];
  
  equals(left["duration"], 0.25, "left duration is .25");
  equals(top["duration"], 0.35, "top duration is .35");
  equals(width["duration"], 0.2, "width duration is .2");
  
  equals(left["timing"], undefined, "No timing for left.");
  equals(top["timing"], undefined, "No timing for top.");
  equals(width["timing"], SC.Animatable.TRANSITION_EASE_IN_OUT, "SC.Animatable.TRANSITION_EASE_IN_OUT for width.");
});

test("animatable should handle concatenated transitions properly", function(){
  // should be identical to view, but with one difference.
  var left = inherited.transitions["left"];
  var top = inherited.transitions["top"];
  var width = inherited.transitions["width"];
  
  equals(left["duration"], 0.99, "left duration is .99 (the overridden value)");
  equals(top["duration"], 0.35, "top duration is .35");
  equals(width["duration"], 0.2, "width duration is .2");
  
  equals(left["timing"], undefined, "No timing for left.");
  equals(top["timing"], undefined, "No timing for top.");
  equals(width["timing"], SC.Animatable.TRANSITION_EASE_IN_OUT, "SC.Animatable.TRANSITION_EASE_IN_OUT for width.");
});

