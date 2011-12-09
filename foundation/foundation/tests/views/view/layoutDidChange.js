// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

module("SC.View#layoutDidChange");

test("notifies layoutStyle & frame change", function() {

	var view = SC.View.create();
	var callCount = 0;
	
	view.addObserver('layoutStyle', function() { callCount++; });
	view.addObserver('frame', function() { callCount++; });

	view.layoutDidChange();
	equals(callCount,2,'should trigger observers for layoutStyle + frame');
});

test("invokes layoutDidChangeFor() on layoutView each time it is called", function() {

	var callCount = 0 ;
	var layoutView = SC.View.create({
		layoutDidChangeFor: function(changedView){
			equals(this.get('childViewsNeedLayout'), YES, 'should set childViewsNeedLayout to YES before calling layoutDidChangeFor()');
			
			equals(view, changedView, 'should pass view');
			callCount++;
		}
	});
	
	var view = SC.View.create({ layoutView: layoutView });

	view.layoutDidChange();
	view.layoutDidChange();
	view.layoutDidChange();
	
	equals(callCount, 3, 'should call layoutView.layoutDidChangeFor each time');
});

test("invokes layoutChildViewsIfNeeded() on layoutView once per runloop", function() {

	var callCount = 0 ;
	var layoutView = SC.View.create({
		layoutChildViewsIfNeeded: function(){
			callCount++;
		}
	});
	
	var view = SC.View.create({ layoutView: layoutView });

	SC.RunLoop.begin();
	view.layoutDidChange();
	view.layoutDidChange();
	view.layoutDidChange();
	SC.RunLoop.end();
	
	equals(callCount, 1, 'should call layoutView.layoutChildViewsIfNeeded one time');
});


test("should not invoke layoutChildViewsIfNeeded() if layoutDidChangeFor() sets childViewsNeedLayout to NO each time", function() {

	var callCount = 0 ;
	var layoutView = SC.View.create({
		layoutDidChangeFor: function() {
			this.set('childViewsNeedLayout', NO);
		},
		
		layoutChildViewsIfNeeded: function(){
			callCount++;
		}
	});
	
	var view = SC.View.create({ layoutView: layoutView });

	SC.RunLoop.begin();
	view.layoutDidChange();
	view.layoutDidChange();
	view.layoutDidChange();
	SC.RunLoop.end();
	
	equals(callCount, 0, 'should not call layoutView.layoutChildViewsIfNeeded');
});

test('returns receiver', function() {
	var view = SC.View.create();
	equals(view.layoutDidChange(), view, 'should return receiver');
});

test("is invoked whenever layout property changes", function() {

	var callCount = 0 ;
	var layoutView = SC.View.create({
		layoutDidChangeFor: function(changedView){
			callCount++;
		}
	});
	
	var view = SC.View.create({ layoutView: layoutView });

	view.set('layout', { top: 0, left: 10 });
	equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

	
});

test("is invoked on parentView if no layoutView whenever layout property changes", function() {

	var callCount = 0 ;
	var parentView = SC.View.create({
		layoutDidChangeFor: function(changedView){
			callCount++;
		}
	});
	
	var view = SC.View.create({});
	view.set('parentView', parentView);

	view.set('layout', { top: 0, left: 10 });
	equals(callCount, 1, 'should call layoutDidChangeFor when setting layout of child view');

	
});
