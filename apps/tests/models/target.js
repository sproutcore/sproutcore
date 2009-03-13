// ==========================================================================
// Project:   TestRunner.Target
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Describes a single target in the current project.  A target can have a name,
  a type and one or more tests that are loaded on demand.

  @extends SC.Record
  @author Charles Jolley
*/
TestRunner.Target = SC.Record.extend(
/** @scope TestRunner.Target.prototype */ {
  
  /** Load the tests for the target. */
  tests: function() {
    this.refreshTests();
    return this._tests;
  }.property().cacheable(),
  
  /** Refresh the tests from the server */
  refreshTests: function() {
  }

}) ;
