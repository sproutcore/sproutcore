// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

sc_require('states/ready');

/**
  Show loading indicator.
*/
TestRunner.READY_LOADING = SC.Responder.create({

  nextResponder: TestRunner.READY,
  
  /**
    Show loading tests view after 100msec
  */
  didBecomeFirstResponder: function() {
    this._timer = this.invokeLater(this._showTestsLoading, 150);
  },
  
  _showTestsLoading: function() {
    this._timer = null ;
    TestRunner.set('currentScene', 'testsLoading');
  },
  
  willLoseFirstResponder: function() {
    if (this._timer) this._timer.invalidate();
    TestRunner.set('currentScene', null);
  },
  
  testsDidChange: function(sender) {
    var tests = TestRunner.testsController;
    if (!(tests.get('status') & SC.Record.READY)) return NO ;
    
    if (tests.get('length')===0) {
      TestRunner.makeFirstResponder(TestRunner.READY_NO_TESTS);
    } else TestRunner.makeFirstResponder(TestRunner.READY_LIST);
  }
  
});