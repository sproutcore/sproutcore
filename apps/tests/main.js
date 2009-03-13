// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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

  // Step 1: Load Your Model Data
  // The default code here will load the fixtures you have defined.
  // Comment out the preload line and add something to refresh from the server
  // when you are ready to pull data from your server.
  //TestRunner.store.preload(.FIXTURES) ;

  // Step 2: Instantiate Your Views
  // The default code here will make the mainPane for your application visible
  // on screen.  If you app gets any level of complexity, you will probably 
  // create multiple pages and panes.  
  TestRunner.getPath('mainPage.mainPane').append() ;

  // Step 3. Load the initial set of targets.  This will make the rest of the 
  // app come alive!
  TestRunner.targetsController.refresh();

  // TODO: Set the content property on your primary controller
  // ex: .contactsController.set('content',.contacts);

} ;

function main() { TestRunner.main(); }
