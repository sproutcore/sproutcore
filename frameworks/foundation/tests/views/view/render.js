// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

// .......................................................
//  render() 
//
module("SC.View#render");

test("default implementation invokes renderChildViews if firstTime = YES", function() {

	var runCount = 0, curContext, curFirstTime;
	var view = SC.View.create({
		renderChildViews: function(context, firstTime) {
	  	equals(context, curContext, 'passed context');
	  	equals(firstTime, curFirstTime, 'passed firstTime flag');
	  	runCount++;
		}
	});
	
	// VERIFY firstTime = YES
	curContext = view.renderContext();
	curFirstTime = YES ;
	view.render(curContext, curFirstTime);
	equals(runCount, 1, 'did invoke renderChildViews()');

	// VERIFY firstTime = NO
	runCount = 0 ;
	curContext = view.renderContext();
	curFirstTime = NO ;
	view.render(curContext, curFirstTime);
	equals(runCount, 0, 'did NOT invoke renderChildViews()');
		
});
  
// .......................................................
// renderChildViews() 
//
  
module("SC.View#renderChildViews");

test("creates a context and then invokes renderToContext or updateLayer on each childView", function() {

	var runCount = 0, curContext, curFirstTime ;
	
	var ChildView = SC.View.extend({
	  renderToContext: function(context) {
	  	equals(context.prevObject, curContext, 'passed child context of curContext');
	  	
	  	equals(context.tagName(), this.get('tagName'), 'context setup with current tag name');
	  	
	  	runCount++; // record run
	  },
	  
	  updateLayer: function() {
	    runCount++;
	  }
	});
	
	var view = SC.View.create({
		childViews: [
			ChildView.extend({ tagName: 'foo' }),
			ChildView.extend({ tagName: 'bar' }),
			ChildView.extend({ tagName: 'baz' })
		]
	});

	// VERIFY: firstTime= YES 	
	curContext = view.renderContext('div');
	curFirstTime= YES ;
	equals(view.renderChildViews(curContext, curFirstTime), curContext, 'returns context');
	equals(runCount, 3, 'renderToContext() invoked for each child view');
	

	// VERIFY: firstTime= NO 	
	runCount = 0 ; //reset
	curContext = view.renderContext('div');
	curFirstTime= NO ;
	equals(view.renderChildViews(curContext, curFirstTime), curContext, 'returns context');
	equals(runCount, 3, 'updateLayer() invoked for each child view');

});

test("creates a context and then invokes renderChildViews to call renderToContext on each childView", function() {

	var runCount = 0, curContext ;
	
	var ChildView = SC.View.extend({
	  renderToContext: function(context) {
	  	equals(context.prevObject, curContext, 'passed child context of curContext');
	  	
	  	equals(context.tagName(), this.get('tagName'), 'context setup with current tag name');
	  	
	  	runCount++; // record run
	  }
  });
	
	var view = SC.View.create({
		childViews: [
			ChildView.extend({ tagName: 'foo' }),
			ChildView.extend({ tagName: 'bar' }),
			ChildView.extend({ tagName: 'baz' })
		]
	});

	// VERIFY: firstTime= YES 	
	curContext = view.renderContext('div');
	view.renderChildViews(curContext);
	equals(runCount, 3, 'renderToContext() invoked for each child view');

});
