// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same */

var TestRunnner;
module("Sample Model from TestRunner Application", { 
  setup: function() {

    // namespace
    TestRunner = SC.Object.create({
      store: SC.Store.create()
    });

    // describes a single target.  has target name, target type, and url to 
    // load tests.
    TestRunner.Target = SC.Record.extend({

      // targetName
      // targetType
      
      // when we get tests, we should actually load the tests.
      tests: SC.Collection.fetch('TestRunner.Test', {
        fetchKey: 'link_tests'
      })
      
    });
    
    // describes a single test.  has a URL to load the test and the test name.
    TestRunner.Test = SC.Record.extend({
      
      // testName
      testUrl: SC.Record.attribute(String).key('link_test'),
      
      target: SC.Record.attribute('TestRunner.Target', {
        inverse: tests,
        isMaster: YES,
        isEditable: NO
      })
      
    });

  }
});

