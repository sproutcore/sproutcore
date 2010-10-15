// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

(function() {
var appleURL = 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } .image-test-class { background-image: url("' + appleURL + '"); } </style>');

var pane = SC.ControlTestPane.design()
  .add("image_not_loaded", SC.ImageView, {
    layout: {width: 200, height: 300},
    value: null
  })
  
  .add("image_loaded", SC.ImageView, {
    layout: {width: 200, height: 300}, 
    status: SC.IMAGE_STATE_LOADED,
    useImageCache: NO,
    value: appleURL
  })
  
  .add('image class', SC.ImageView, {
    layout: {width: 200, height: 300},
    value: 'image-test-class'
  })
  
  .add('image canvas', SC.ImageView, {
    layout: {width: 200, height: 300},
    useCanvas: YES,
    value: appleURL
  });

module('SC.ImageView ui', pane.standardSetup());

test("Verify that all the rendering properties of an image that is being loaded are correct", function() {
  var view = pane.view('image_not_loaded');
  ok(view.get('isVisibleInWindow'), 'image_not_loaded is visible in window');
  
  view.set('value', appleURL);
  ok(view.get('status') !== 'loaded', 'PRECOND - status should not be loaded (status=%@)'.fmt(view.get('status')));
  
  var url = view.$().attr('src');
  ok((url.indexOf('base64')!=-1) || (url.indexOf('blank.gif')!=-1), "The src should be blank URL. url = %@".fmt(url));
});


test("Verify that all the rendering properties of an image that is loaded are correct", function() {
  ok(pane.view('image_loaded').get('isVisibleInWindow'), 'image_loaded is visible in window');
  equals(pane.view('image_loaded').$().attr('src'), appleURL, "should be the same url");    
});


test("Verify that the tooltip is correctly being set as both the title and attribute (disabling localization for this test)", function() {
  var imageView = pane.view('image_loaded');
  var testToolTip = 'This is a test tooltip';
  
  SC.RunLoop.begin();
  imageView.set('localize', NO);
  imageView.set('toolTip', testToolTip);
  SC.RunLoop.end();
  
  ok((imageView.$().attr('title') === testToolTip), "The title attribute should be set to \"" + testToolTip + "\"");
  ok((imageView.$().attr('alt') === testToolTip), "The alt attribute should be set to \"" + testToolTip + "\"");
});

test("Verify image class", function() {
  var view = pane.view('image class'),
      cq = view.$();
  
  ok(cq.hasClass('image-test-class'), "The class value should be on the element");
});

test("Verify canvas rendering and properties", function() {
  var view = pane.view('image canvas'),
      cq = view.$();
  
  equals(cq.attr('width'), 200, "The width of the canvas element should be set");
  equals(cq.attr('height'), 300, "The height of the canvas element should be set");
});

})();