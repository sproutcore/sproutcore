// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.imageQueue Test for queue stalling (https://github.com/sproutcore/sproutcore/pull/716)
// ========================================================================
/*globals module test ok isObj equals expects */

module("Image Queue", {
    setup: function() {
		this.guardTimeout = 10000;
		this.firstGoodImageURL = sc_static('images/sproutcore.png');
		this.secondGoodImageURL = sc_static('images/sproutcore-logo.png');
		this.badImageURL = "http://www.sproutcore.com/images/foobar.png";
	}
});

test("Ensure queue is in known state.", function() {
	SC.imageQueue._images = {};
	SC.imageQueue._loading = [] ;
	SC.imageQueue._foregroundQueue = [];
	SC.imageQueue._backgroundQueue = [];
	SC.imageQueue.set('isLoading', NO);
	
    equals(SC.imageQueue.activeRequests, 0, "There should be no active requests");
});

test("Attempt to load a non-existent image.", function() {
	SC.imageQueue.loadImage(this.badImageURL, {action: function(imageUrl, imageOrError) {
	    // verify request loaded OK
	    ok(SC.typeOf(imageOrError) === "error", "Image retrieval should fail with error.");
	    // resume executing tests
	    start();
	  }}, 'action', NO);	

  	stop(this.guardTimeout);
});

test("Load a valid image successfully.", function() {
	SC.imageQueue.loadImage(this.firstGoodImageURL, {action: function(imageUrl, imageOrError) {
	    // verify request loaded OK
	    ok(SC.typeOf(imageOrError) !== "error", "Image should be retrieved successfully.");
	    // resume executing tests
	    start();
	  }}, 'action', NO);	
	  
    stop(this.guardTimeout);
});

test("Attempt to reload previous non-existent image.", function() {
	SC.imageQueue.loadImage(this.badImageURL, {action: function(imageUrl, imageOrError) {
	    // verify request loaded OK
	    ok(SC.typeOf(imageOrError) === "error", "Image retrieval should fail with error.");
	    // resume executing tests
	    start();
	  }}, 'action', NO);	

  	stop(this.guardTimeout);
});

test("Reload previous valid image (now cached) successfully.", function() {
	SC.imageQueue.loadImage(this.firstGoodImageURL, {action: function(imageUrl, imageOrError) {
	    // verify request loaded OK
	    ok(SC.typeOf(imageOrError) !== "error", "Image should be retrieved successfully.");
	    // resume executing tests
	    start();
	  }}, 'action', NO);	

  	stop(this.guardTimeout);
});

test("Load a second non-cached image successfully.", function() {
	SC.imageQueue.loadImage(this.secondGoodImageURL, {action: function(imageUrl, imageOrError) {
	    // verify request loaded OK
	    ok(SC.typeOf(imageOrError) !== "error", "Image should be retrieved successfully.");
	    // resume executing tests
	    start();
	  }}, 'action', NO);	

  	stop(this.guardTimeout);
});
