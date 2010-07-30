// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: 2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.View#prepareContext");

test("populates context with layerId & classNames from view if firstTime", function() {
  var view = SC.View.create({
    layerId: "foo", 
    classNames: ["bar"] 
  });
  var context = view.renderContext();
  
  // test with firstTime
  view.prepareContext(context, YES);
  equals(context.id(), 'foo', 'did set id');
  ok(context.hasClass('bar'), 'did set class names');
});

test("check that testing without first time does not render to a context (no render needed)", function() {
  var view = SC.View.create({
    layerId: "foo", 
    classNames: ["bar"],
    createRenderer: function(t) {  return undefined; }
  });
  var context = view.renderContext();
  view.prepareContext(context, NO);
  
  // updating of view settings are now handled through CoreQuery, never
  // touching rendercontext, in the function updateViewSettings.
  ok(context.id() !== 'foo', 'did not set id');
  ok(!context.hasClass('bar'), 'did not set class name');
});

test("invokes renderLayout if first time", function() {
  var runCount = 0;
  var context, isFirstTime ;
  var view = SC.View.create({
    renderLayout: function(aContext, firstTime) { 
    	equals(aContext, context, 'passed context');
    	equals(firstTime, isFirstTime, 'passed firstTime');
    	runCount++; 
    }
  });
  
	// test w/ firstTime
  context = view.renderContext();
  isFirstTime = YES ;
	view.prepareContext(context, YES);
	equals(runCount, 1, 'should call renderLayout');
	
	// test w/o firstTime
	runCount = 0 ;
  context = view.renderContext();
  isFirstTime = NO ;
	view.prepareContext(context, NO);
	equals(runCount, 0, 'should not call renderLayout');

});


test("adds text-selectable class if view has isTextSelectable", function() {

  var view = SC.View.create() ;
  var context ;
  
  context = view.renderContext();
  view.set('isTextSelectable', YES);
  view.prepareContext(context, YES);
  ok(context.hasClass('allow-select'), 'should have text-selectable class');
  
  context = view.renderContext();
  view.set('isTextSelectable', NO);
  view.prepareContext(context, YES);
  ok(!context.hasClass('allow-select'), 'should NOT have text-selectable class');
  
});

test("adds disabled class if view isEnabled = NO", function() {

  var view = SC.View.create() ;
  var context ;
  
  context = view.renderContext();
  view.set('isEnabled', YES);
  view.prepareContext(context, YES);
  ok(!context.hasClass('disabled'), 'should NOT have disabled class');
  
  context = view.renderContext();
  view.set('isEnabled', NO);
  view.prepareContext(context, YES);
  ok(context.hasClass('disabled'), 'should have disabled class');
  
});

test("adds hidden class if view isVisible = NO", function() {

  var view = SC.View.create() ;
  var context ;
  
  context = view.renderContext();
  view.set('isVisible', YES);
  view.prepareContext(context, YES);
  ok(!context.hasClass('hidden'), 'should NOT have hidden class');
  
  context = view.renderContext();
  view.set('isVisible', NO);
  view.prepareContext(context, YES);
  ok(context.hasClass('hidden'), 'should have hidden class');  
});

test("invokes render() passing context & firstTime", function() {

	var runCount = 0;
  var context, isFirstTime ;
  var view = SC.View.create({
  	render: function(theContext, firstTime) {
  		equals(context, theContext, 'context passed');
  		equals(firstTime, isFirstTime, 'firstTime passed');
  		runCount++;
  	}
  }) ;
  
  context = view.renderContext();
  isFirstTime = YES;
	view.prepareContext(context, YES);  
	equals(runCount, 1, 'did invoke render()');

  runCount = 0 ;
  context = view.renderContext();
  isFirstTime = NO;
	view.prepareContext(context, NO);  
	equals(runCount, 1, 'did invoke render()');
});

test("invokes renderMixin() from mixins, passing context & firstTime", function() {

	var runCount = 0;
  var context, isFirstTime ;
	
	// define a few mixins to make sure this works w/ multiple mixins  	
	var mixinA = {
  	renderMixin: function(theContext, firstTime) {
  		equals(context, theContext, 'context passed');
  		equals(firstTime, isFirstTime, 'firstTime passed');
  		runCount++;
  	}
	};

	var mixinB = {
  	renderMixin: function(theContext, firstTime) {
  		equals(context, theContext, 'context passed');
  		equals(firstTime, isFirstTime, 'firstTime passed');
  		runCount++;
  	}
	};

  var view = SC.View.create(mixinA, mixinB) ;
  
  context = view.renderContext();
  isFirstTime = YES;
	view.prepareContext(context, YES);  
	equals(runCount, 2, 'did invoke renderMixin() from both mixins');

  runCount = 0 ;
  context = view.renderContext();
  isFirstTime = NO;
	view.prepareContext(context, NO);  
	equals(runCount, 2, 'did invoke renderMixin() from both mixins');
});

test("Properly sets cursor class", function() {
  var view = SC.View.create();
  var context = view.renderContext();
  var cursor = SC.Cursor.create({className: 'testClass'});
  view.set('cursor', cursor);
  view.prepareContext(context, YES);
  ok(context.hasClass(cursor.get('className')), "Should have cursor object's class");
  //TODO: Test for setting string.
  var view2 = SC.View.create();
  view.appendChild(view2);
  var context = view2.renderContext();
  view2.prepareContext(context, YES);
  ok(context.hasClass(cursor.get('className')), "Cursorless child view should inherit parent view's cursor.");
});
