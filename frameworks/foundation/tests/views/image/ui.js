// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
  var appleURL='http://weblogs.baltimoresun.com/business/consuminginterests/blog/apple-logo1.jpg';

  var pane = SC.ControlTestPane.design()
    .add("image_not_loaded", SC.ImageView, { 
      value: appleURL, layout : {width: 200, height: 300}
    })
    .add("image_loaded", SC.ImageView, { 
      value: appleURL, status:'loaded', layout : {width: 200, height: 300}
    });
    
    pane.show();


    module('SC.ImageView ui', pane.standardSetup());
  
  
    test("Verify that all the rendering properties of an image that is being loaded are correct", function() {
      ok(pane.view('image_not_loaded').get('isVisibleInWindow'), 'image_not_loaded is visible in window');
      ok((pane.view('image_not_loaded').$().attr('src').indexOf('blank.gif')!=-1), "The src should be set to the blank URL.");    
    });
    
    test("Verify that all the rendering properties of an image that is loaded are correct", function() {
      ok(pane.view('image_loaded').get('isVisibleInWindow'), 'image_loaded is visible in window');
      equals(pane.view('image_loaded').$().attr('src'), appleURL, "should be the same url");    
    });
    
})();
  