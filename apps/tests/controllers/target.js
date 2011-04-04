// ==========================================================================
// Project:   TestRunner.targetController
// Copyright: ©2011 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The currently selected target.  Used by the testsController to get the 
  tests of the target.  May be used by other parts of the app to control the
  selected target.

  @extends SC.ObjectController
*/
TestRunner.targetController = SC.ObjectController.create(
/** @scope TestRunner.targetController.prototype */ {

  contentBinding: 'TestRunner.sourceController.selection',
  
  nameDidChange: function() {
    var name = this.get('name');
    if (name) name = name.slice(1);
    document.title = "_Window Title".loc(name || '_No Target'.loc());  
  }.observes('name')
  
}) ;
