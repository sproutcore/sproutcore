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
  
  /**
    Loads the targets from the server.  When the targets have loaded, adds 
    them to the store and then sets the local content.
  */
  refreshTests: function() {
    if (!this._tests) this._tests = [] ;
    SC.Request.getUrl(this.get('link_tests'))
      .notify(this, 'testsDidRefresh').set('isJSON', YES).send();
  },
  
  testsDidRefresh: function(request) {
    var json = request.get('response'), len = json.length, idx;
    for(idx=0;idx<len;idx++) json[idx].guid = json[idx].url ; // patch
    var tests = SC.Store.updateRecords(json, SC.Store, TestRunner.Test);
    tests = tests.sort(function(a,b) { 
      a = a.get('filename'); 
      b = b.get('filename');
      return (a<b) ? -1 : (a>b) ? 1 : 0;
    });

    this.propertyWillChange('tests');
    this._tests = tests ;
    this.propertyDidChange('tests');
  }

}) ;
