SC.ANIMATABLE
=============

A simple mixin called SC.Animatable is provided. What does it do?
It makes CSS transitions for you, and if they aren't available,
implements them in JavaScript.

Current good things:
* Animates 300 SC.LabelViews acceptably with only JavaScript. Animates >500
  just as well (if not better) with CSS transitions.
* Automatically detects if CSS transitions are available.
	
Current flaws:
* Supports only a limited subset of properties. For instance, no support for
  animating background colors.
	
Example Usage:

		aView: SC.LabelView.design(SC.Animatable, {
			transitions: {
				left: .25,
				top: {duration: .25}
				width: { duration: .25, timing: SC.Animatable.TIMING_EASE_IN_OUT }, // with timing curve
				height: { duration: .5, timing: [0, 0, 0.58, 1.0] } // with custom timing curve
			}
		})


Including in your Project
===============================================================================
In your project-level Buildfile, there is a line like this:
config :all, :required => :sproutcore

Add the animate framework to it by changing it to this:
config :all, :required => [:sproutcore, 'sproutcore/animation']

Now, you should be able to use it in any view, as demonstrated above!


Reference
===============================================================================
The API is simple. You set up transitions in the "transitions" property, and can
supply them with a few parameters:
* duration: The amount of time in seconds that the animation should last.
* timing:   The timing curve to use. Defaults to SC.Animatable.defaultTimingFunction. See "Timing"


Timing
------
Timing is handled using beziér curves (like in CSS transitions).

The variable SC.Animatable.defaultTimingFunction can be used to globally set the timing
curve; any transition that has "null" as its timing curve will use this default
timing curve.

For example, you could include this line in one of your JavaScript files:
SC.Animatable.defaultTimingFunction = SC.Animatable.TRANSITION_EASE_IN_OUT;

There are a few built-in timing curves (shown here with their values). The curves
with CSS in their name are CSS-only versions; JavaScript-based animations will use
linear. The big benefit of CSS-only timing functions is that JavaScript performance
is not impacted; to handle timing curves, JavaScript has to do some semi-heavy calculations
**each frame**. Using CSS-only transitions gives a graceful degradation of sorts.

* SC.Animatable.TRANSITION_NONE: "linear"
* SC.Animatable.TRANSITION_CSS_EASE: "ease"
* SC.Animatable.TRANSITION_CSS_EASE_IN: "ease-in"
* SC.Animatable.TRANSITION_CSS_EASE_OUT: "ease-out"
* SC.Animatable.TRANSITION_CSS_EASE_OUT: "ease-in-out"
* SC.Animatable.TRANSITION_EASE: [0.25, 0.1, 0.25, 1.0]
* SC.Animatable.TRANSITION_LINEAR: [0.0, 0.0, 1.0, 1.0]
* SC.Animatable.TRANSITION_EASE_IN: [0.42, 0.0, 1.0, 1.0]
* SC.Animatable.TRANSITION_EASE_OUT: [0, 0, 0.58, 1.0]
* SC.Animatable.TRANSITION_EASE_IN_OUT: [0.42, 0, 0.58, 1.0]


**Note**: The TRANSITION_NONE value is technically a CSS-only "linear" curve; as CSS-only
curves make JavaScript use linear, it all works out.

