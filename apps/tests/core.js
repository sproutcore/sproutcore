// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals TestRunner */

/** @namespace

  Test Runner application for SproutCore.  This is a simple application that
  loads the list of unit tests from the built-in sc-server and then provides
  an interface for running them.
  
  You can access this test runner by visiting:
  
  http://localhost:4020/TARGET_NAME/-tests
  
  or
  
  http://localhost:4020/sproutcore/tests#TARGET_NAME
  
  The source for for the test runner is also heavily documented so you can 
  use it as an example for building your own applications.  Take a look.
  
  @extends SC.Object
*/
TestRunner = SC.Object.create(/** @scope TestRunner.prototype */ {

  NAMESPACE: 'TestRunner',
  VERSION: '1.0.0',
  
  FIXTURES: []

}) ;
