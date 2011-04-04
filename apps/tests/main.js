// ==========================================================================
// Project:   TestRunner
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals TestRunner */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
TestRunner.main = function main() {
  
  // setup views
  TestRunner.getPath('mainPage.mainPane').append() ;

  TestRunner.makeFirstResponder(TestRunner.START);

  // load initial data
  //var targets = TestRunner.store.findAll(CoreTools.Target);
  //TestRunner.targetsController.set('content', targets);

} ;

function main() { TestRunner.main(); }
