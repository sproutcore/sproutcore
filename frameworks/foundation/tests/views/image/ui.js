// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');


var pane = SC.ControlTestPane.design()
    .add("image", SC.ImageView, { 
      value: "http://weblogs.baltimoresun.com/business/consuminginterests/blog/apple-logo1.jpg", status:'loaded', layout : {width: 200, height: 300}
    });
    






pane.show();


  module('SC.ImageView ui', pane.standardSetup());
  
  
  test("hello world", function() {
    ok(!pane.view('image').get('isVisibleInWindow'), 'basic is visible in window');
    equals(pane.view('image').$().attr('src'), "http://weblogs.baltimoresun.com/business/consuminginterests/blog/apple-logo1.jpg", "should be the same url");
    
    
    
    
    
  });
  
  module('SC.ImageView ui2', pane.standardSetup());
  
  
  test("hello world", function() {
    ok(!pane.view('image').get('isVisibleInWindow'), 'basic is visible in window2');
    
    
    
    
  });
  