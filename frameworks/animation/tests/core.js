// ==========================================================================
// Project:   SproutCore Animation
// ==========================================================================

/*globals module test ok isObj equals expects */
var view, base, inherited, pane;
module("Animatable", {
  setup: function() {
    SC.RunLoop.begin();
    pane = SC.Pane.create({
      layout: { top: 0, right: 0, width: 200, height: 200 },
    });
    pane.append();
    
    view = SC.View.create(SC.Animatable, { 
      layout: { left: 100, top: 100, height: 100, width: 100 },
      style: { opacity: .5 },
      transitions: {
        left: 0.25,
        top: { duration: 0.35 },
        width: { duration: 0.2, timing: SC.Animatable.TRANSITION_EASE_IN_OUT },
        style: { opacity: 1 }
      }
    });
    pane.appendChild(view);
    
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
    
    SC.RunLoop.end();
  },
  
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

test("animatable handler for layer update should ensure both layout and styles are set in the 'current style'.", function() {
  var original_transition_enabled = SC.Animatable.enableCSSTransitions;
  SC.Animatable.enableCSSTransitions = NO;
  
  // we should have a style (it is inside a pane)
  current = view.getCurrentJavaScriptStyles();
  ok(!SC.none(current), "There now SHOULD be a current JS style.");
  
  // and now, make sure we have both style AND layout set properly.
  equals(current["opacity"], .5, "opacity should be .5");
  equals(current["left"], 100, "left should be 100");
  
  // go back to the beginning
  SC.Animatable.enableCSSTransitions = original_transition_enabled;
});

test("animatable callbacks work in general", function(){
  SC.RunLoop.begin();
  view.transitions["left"] = {
    duration: .25,
    action: function() {
      console.error("Callback");
      ok(true, "Callback was called.");
      start();
    }
  };
  view.updateLayout();
  view.adjust("left", 0).updateLayout();
  SC.RunLoop.end();
  stop();
  
  setTimeout(function(){
    ok(false, "Timeout! Callback was not called.");
    start();
  }, 1000);
  
});
